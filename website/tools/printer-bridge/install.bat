@echo off
REM Installs the Python dependencies for the printer bridge (python-escpos, pyserial, websockets).
echo Installing printer bridge dependencies...
python -m pip install --upgrade pip
python -m pip install -r "%~dp0requirements.txt"
echo.
echo Done. Start the bridge with start.bat
pause
