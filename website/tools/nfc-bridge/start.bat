@echo off
REM Starts the NFC bridge (reads card UIDs and serves them on ws://127.0.0.1:8765).
python "%~dp0nfc_bridge.py"
pause
