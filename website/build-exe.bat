@echo off
REM Builds the BonPrinter Demo as a portable Windows .exe.
REM Output: dist-app\BonPrinter-Demo-<version>.exe
cd /d "%~dp0"
call npm run app:dist
echo.
echo Done. EXE is in: %~dp0dist-app
pause
