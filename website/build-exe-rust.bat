@echo off
REM Builds the BonPrinter Demo .exe using the RUST Excel-report engine
REM (rust_xlsxwriter) instead of the Python one. Needs the Rust toolchain (cargo).
REM The default build-exe.bat uses Python; this one just sets EXCEL_ENGINE=rust.
cd /d "%~dp0"
set EXCEL_ENGINE=rust
call npm run app:dist
echo.
echo Done (Rust Excel engine). EXE is in: %~dp0dist-app
pause
