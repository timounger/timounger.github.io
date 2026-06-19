@echo off
REM Starts the printer bridge (prints ESC/POS bons on ws://127.0.0.1:8766).
python "%~dp0printer_bridge.py"
pause
