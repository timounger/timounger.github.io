@echo off
REM Installs the Python dependency for the Excel report tool (openpyxl).
echo Installing Excel report dependencies...
python -m pip install --upgrade pip
python -m pip install -r "%~dp0requirements.txt"
echo.
echo Done.
pause
