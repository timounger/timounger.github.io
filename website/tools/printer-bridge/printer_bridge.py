"""!
********************************************************************************
@file   printer_bridge.py
@brief  Local bridge between the BonPrinter web demo / desktop app and an
        ESC/POS thermal printer (e.g. Epson TM-T20III) on a serial COM port.

        The browser cannot talk to a serial port directly, so this small local
        bridge receives print jobs over a WebSocket and prints one receipt per
        item amount in a background thread, with a short delay between bons to
        prevent a printer buffer overflow (same approach as the reference
        printer.py). It can also kick the cash drawer.

        Requirements: Python 3.9+, an ESC/POS printer on a COM port, and:
            pip install python-escpos pyserial websockets
********************************************************************************
"""

import asyncio
import json
import queue
import threading
import time

import serial
import websockets
from escpos.printer import Dummy
from serial.tools.list_ports import comports

# WebSocket port the web app connects to for printing.
PORT = 8766
# Delay after every bon, in seconds, to prevent a printer buffer overflow.
PRINT_DELAY = 0.75
# How often to broadcast the available COM ports, in seconds (keeps the menu fresh).
PORTS_BROADCAST_SECONDS = 2
# Currency unit printed next to the price.
UNIT = "EUR"
# Receipt line width (characters) per paper width in mm.
LINE_WIDTHS = {58: 34, 80: 48}
DEFAULT_PAPER_WIDTH = 58
# Cash drawer connector pin (first connector = pin 2, second = pin 5).
DRAWER_PIN = 2

clients = set()
_jobs: "queue.Queue[dict]" = queue.Queue()
_lock = threading.Lock()
_com_port = None
_line_width = LINE_WIDTHS[DEFAULT_PAPER_WIDTH]
_serial = None
_serial_name = None


def _set_port(name):
    """! Store the selected serial COM port (None disables printing). @param name : port name or None """
    global _com_port
    with _lock:
        _com_port = name


def _set_width(width_mm):
    """! Set the receipt line width from the paper width. @param width_mm : paper width in mm (58 or 80) """
    global _line_width
    _line_width = LINE_WIDTHS.get(width_mm, LINE_WIDTHS[DEFAULT_PAPER_WIDTH])


def _close_serial():
    """! Close the serial connection if open. """
    global _serial, _serial_name
    if _serial is not None:
        try:
            if _serial.is_open:
                _serial.close()
        except Exception:  # pylint: disable=broad-except
            pass
    _serial = None
    _serial_name = None


def _ensure_serial():
    """!
    @brief Open (or reuse) the serial connection to the selected COM port,
           reconnecting when the port changed.
    @return the open serial.Serial, or None when no port is configured/available
    """
    global _serial, _serial_name
    with _lock:
        name = _com_port
    if not name:
        _close_serial()
        return None
    if _serial is not None and _serial_name == name and _serial.is_open:
        return _serial
    _close_serial()
    try:
        _serial = serial.Serial(name)
        _serial_name = name
    except Exception:  # pylint: disable=broad-except
        _close_serial()
    return _serial


def _build_bon(line, user, date, header1="", header2=""):
    """!
    @brief Build the ESC/POS bytes for a single receipt (text only).
    @param line : item dict with name, price and showPrice
    @param user : cashier / user name printed on the bon
    @param date : date string printed on the bon
    @param header1 : first receipt header line, centered atop the bon
    @param header2 : second receipt header line, centered atop the bon
    @return ESC/POS byte string for the receipt
    """
    width = _line_width
    dummy = Dummy()
    dummy.set_with_default()
    # receipt header lines (centered) printed above every bon
    for header_line in (header1, header2):
        if header_line:
            dummy.text(f"{header_line.center(width)[:width]}\n")
    # small one-line header: "YYYY/MM/DD HH:MM:SS User"
    header = f"{date} {user}".strip()
    if header:
        dummy.text(f"{header}\n")
    # article name (large, double width): truncate to width // 2 chars so a long
    # name fits one line instead of the printer wrapping it (same as reference).
    name = str(line.get("name", ""))[: max(1, width // 2)]
    dummy.set(double_width=True, double_height=True)
    dummy.text(f"{name}\n")
    dummy.set_with_default()
    # price below the article, right aligned: "EUR 4.50"
    if line.get("showPrice", True):
        right = f"{UNIT} {float(line.get('price', 0.0)):.2f}"
        dummy.text(f"{right.rjust(width)}\n")
    dummy.text("\n")
    dummy.cut(mode="PART")
    return dummy.output


def _build_drawer():
    """! Build the ESC/POS bytes that kick the cash drawer. @return ESC/POS byte string """
    dummy = Dummy()
    dummy.cashdraw(pin=DRAWER_PIN)
    return dummy.output


def _worker():
    """! Background worker: print queued bons one by one with a delay between them. """
    while True:
        job = _jobs.get()
        ser = _ensure_serial()
        if ser is None:
            continue  # no printer configured -> drop the job
        try:
            if job["kind"] == "drawer":
                ser.write(_build_drawer())
            else:
                bon = _build_bon(
                    job["line"],
                    job["user"],
                    job["date"],
                    job.get("header1", ""),
                    job.get("header2", ""),
                )
                amount = max(1, int(job["line"].get("qty", 1)))
                for _ in range(amount):
                    ser.write(bon)
                    time.sleep(PRINT_DELAY)
        except Exception:  # pylint: disable=broad-except
            _close_serial()


def list_ports():
    """! List the available serial COM ports. @return sorted list of port names """
    try:
        return sorted(port.device for port in comports())
    except Exception:  # pylint: disable=broad-except
        return []


async def broadcast_ports():
    """! Send the available COM ports to every connected web client. """
    message = json.dumps({"type": "ports", "ports": list_ports()})
    for client in list(clients):
        try:
            await client.send(message)
        except Exception:  # pylint: disable=broad-except
            clients.discard(client)


async def handler(websocket):
    """! Handle one client: turn its messages into print jobs. @param websocket : client connection """
    clients.add(websocket)
    try:
        await websocket.send(json.dumps({"type": "ports", "ports": list_ports()}))
        async for message in websocket:
            try:
                data = json.loads(message)
            except Exception:  # pylint: disable=broad-except
                continue
            message_type = data.get("type")
            if message_type == "port":
                _set_port(data.get("port") or None)
            elif message_type == "width":
                _set_width(int(data.get("width", DEFAULT_PAPER_WIDTH)))
            elif message_type == "drawer":
                _jobs.put({"kind": "drawer"})
            elif message_type == "print":
                user = data.get("user") or ""
                date = data.get("date") or ""
                header1 = data.get("header1") or ""
                header2 = data.get("header2") or ""
                for line in data.get("lines", []):
                    _jobs.put({
                        "kind": "bon",
                        "line": line,
                        "user": user,
                        "date": date,
                        "header1": header1,
                        "header2": header2,
                    })
    except websockets.ConnectionClosed:
        pass
    finally:
        clients.discard(websocket)


async def ports_loop():
    """! Periodically broadcast the available COM ports so the menu stays fresh. """
    while True:
        await asyncio.sleep(PORTS_BROADCAST_SECONDS)
        await broadcast_ports()


async def main():
    """! Start the print worker thread, the COM-port broadcaster and the server. """
    threading.Thread(target=_worker, daemon=True).start()
    async with websockets.serve(handler, "127.0.0.1", PORT):
        print(f"Printer bridge running on ws://127.0.0.1:{PORT}")
        await ports_loop()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Printer bridge stopped")
