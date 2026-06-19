"""!
********************************************************************************
@file   nfc_bridge.py
@brief  Local bridge between a PC/SC NFC reader (e.g. ACS ACR1252U) and the
        BonPrinter web demo / desktop app.

        It talks to the reader on the low PC/SC level (SCardControl, like the
        reference nfc.py): it disables the reader's automatic insertion/removal
        beeps, reads card UIDs and forwards them over a local WebSocket, and -
        on request from the app - signals success (green + beep) or failure
        (red + beeps). Open the demo with "?nfc" to enable the RFID login.

        Requirements: Python 3.9+, a PC/SC reader with driver installed, and:
            pip install pyscard websockets
********************************************************************************
"""

import asyncio
import json
import threading

import websockets
from smartcard.scard import (
    SCardEstablishContext,
    SCardListReaders,
    SCardConnect,
    SCardDisconnect,
    SCardControl,
    SCARD_SCOPE_USER,
    SCARD_S_SUCCESS,
    SCARD_SHARE_DIRECT,
    SCARD_CTL_CODE,
    SCARD_UNPOWER_CARD,
)
from smartcard.util import toHexString

# Escape control code for ACS readers (SCardControl).
CTL_CODE = SCARD_CTL_CODE(3500)
# Pseudo-APDU "Get Data (UID)".
GET_UID = [0xFF, 0xCA, 0x00, 0x00, 0x00]
# Set LED/buzzer behaviour: bit3/bit4 (card insertion/removal beeps) cleared so
# the reader only beeps when WE tell it to (value 0x66, see reference nfc.py).
SET_BEHAVIOR = [0xE0, 0x00, 0x00, 0x21, 0x01, 0x66]
# ACR122U-compatible LED + buzzer command (FF 00 40 <led> 04 <t1> <t2> <reps> <buzzer>).
LED_OFF = [0xFF, 0x00, 0x40, 0x0C, 0x04, 0x00, 0x00, 0x00, 0x00]
BEEP_GREEN = [0xFF, 0x00, 0x40, 0xAE, 0x04, 0x01, 0x00, 0x01, 0x01]
BEEP_RED = [0xFF, 0x00, 0x40, 0x5C, 0x04, 0x02, 0x01, 0x03, 0x01]
# Two orange beeps - signals a blocked action (e.g. card tapped while logged in).
BEEP_ORANGE = [0xFF, 0x00, 0x40, 0xFC, 0x04, 0x01, 0x01, 0x02, 0x01]
# Maps a feedback name from the app to its LED/buzzer command.
FEEDBACK = {"success": BEEP_GREEN, "fail": BEEP_RED, "blocked": BEEP_ORANGE}
# Trailing status word that signals success.
SW_OK = [0x90, 0x00]
# WebSocket port the web demo connects to (must match the "?nfc=<port>" value).
PORT = 8765
# How often to poll the reader, in seconds.
POLL_SECONDS = 0.3
# Broadcast the reader list every Nth poll (~2 s) so the config menu stays fresh.
READERS_BROADCAST_TICKS = 7

clients = set()
_lock = threading.Lock()
_ctx = None
_card = None


def _disconnect():
    """! Drop the current reader connection so the next call reconnects. """
    global _card
    if _card is not None:
        try:
            SCardDisconnect(_card, SCARD_UNPOWER_CARD)
        except Exception:  # pylint: disable=broad-except
            pass
        _card = None


def _ensure_connection():
    """!
    @brief Connect (SHARE_DIRECT) to the first PICC reader and apply the quiet
           beep behaviour. Reuses an existing connection.
    @return True when a reader connection is available
    """
    global _ctx, _card
    if _card is not None:
        return True
    if _ctx is None:
        hresult, ctx = SCardEstablishContext(SCARD_SCOPE_USER)
        if hresult != SCARD_S_SUCCESS:
            return False
        _ctx = ctx
    hresult, reader_names = SCardListReaders(_ctx, [])
    if hresult != SCARD_S_SUCCESS or not reader_names:
        return False
    reader = next((name for name in reader_names if "PICC" in name), reader_names[0])
    hresult, card, _protocol = SCardConnect(_ctx, reader, SCARD_SHARE_DIRECT, 0)
    if hresult != SCARD_S_SUCCESS:
        return False
    _card = card
    _send(SET_BEHAVIOR)  # disable automatic card in/out beeps
    _send(LED_OFF)
    return True


def _send(payload):
    """!
    @brief Send a control command to the reader; reconnect next time on failure.
    @param payload : command bytes
    @return the response bytes, or None on failure
    """
    if not _ensure_connection():
        return None
    hresult, response = SCardControl(_card, CTL_CODE, payload)
    if hresult != SCARD_S_SUCCESS:
        _disconnect()
        return None
    return response


def read_uid():
    """!
    @brief Read the UID of a card currently on the reader.
    @return UID string (e.g. "9B 96 31 16") or None when no card/no reader.
    """
    with _lock:
        response = _send(GET_UID)
    if not response or len(response) < 3 or list(response[-2:]) != SW_OK:
        return None
    return toHexString(list(response[:-2]))


def set_feedback(name):
    """!
    @brief Signal a result on the reader: "success" (green + beep), "fail"
           (red + beeps) or "blocked" (two orange beeps).
    @param name : one of "success", "fail", "blocked"
    """
    command = FEEDBACK.get(name)
    if command is None:
        return
    with _lock:
        _send(command)


def list_readers():
    """!
    @brief List the names of the connected PC/SC readers.
    @return list of reader name strings (empty when none / no PC/SC service)
    """
    global _ctx
    with _lock:
        if _ctx is None:
            hresult, ctx = SCardEstablishContext(SCARD_SCOPE_USER)
            if hresult != SCARD_S_SUCCESS:
                return []
            _ctx = ctx
        hresult, names = SCardListReaders(_ctx, [])
        if hresult != SCARD_S_SUCCESS or not names:
            return []
        return list(names)


async def broadcast(uid):
    """! Send a UID to every connected web client. @param uid : card UID string """
    message = json.dumps({"uid": uid})
    for client in list(clients):
        try:
            await client.send(message)
        except Exception:  # pylint: disable=broad-except
            clients.discard(client)


async def broadcast_readers():
    """! Send the list of available readers to every connected web client. """
    message = json.dumps({"readers": list_readers()})
    for client in list(clients):
        try:
            await client.send(message)
        except Exception:  # pylint: disable=broad-except
            clients.discard(client)


async def reader_loop():
    """! Poll the reader; broadcast new card UIDs and the reader list regularly. """
    last = None
    tick = 0
    while True:
        uid = read_uid()
        if uid and uid != last:
            last = uid
            print("UID:", uid)
            await broadcast(uid)
        elif not uid:
            last = None  # card removed -> allow re-tapping the same card
        if tick % READERS_BROADCAST_TICKS == 0:
            await broadcast_readers()
        tick += 1
        await asyncio.sleep(POLL_SECONDS)


async def handler(websocket):
    """! Track a client and act on its feedback messages. @param websocket : client connection """
    clients.add(websocket)
    loop = asyncio.get_event_loop()
    try:
        await websocket.send(json.dumps({"readers": list_readers()}))
        async for message in websocket:
            try:
                feedback = json.loads(message).get("feedback")
            except Exception:  # pylint: disable=broad-except
                feedback = None
            if feedback in FEEDBACK:
                await loop.run_in_executor(None, set_feedback, feedback)
    finally:
        clients.discard(websocket)


async def main():
    """! Start the WebSocket server and the reader polling loop. """
    async with websockets.serve(handler, "127.0.0.1", PORT):
        print(f"NFC bridge running on ws://127.0.0.1:{PORT} (open the demo with ?nfc)")
        await reader_loop()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("NFC bridge stopped")
