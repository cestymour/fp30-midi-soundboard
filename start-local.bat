@echo off
setlocal

set "ROOT=%~dp0"
set "PORT=8080"
set "URL=http://localhost:%PORT%/"
set "TITLE=FP30 MIDI Soundboard Local Server"

where py >nul 2>nul
if not errorlevel 1 (
  start "%TITLE%" /D "%ROOT%" cmd /k py -m http.server %PORT% --bind 127.0.0.1 --directory .
  goto open_browser
)

where python >nul 2>nul
if not errorlevel 1 (
  start "%TITLE%" /D "%ROOT%" cmd /k python -m http.server %PORT% --bind 127.0.0.1 --directory .
  goto open_browser
)

where node >nul 2>nul
if not errorlevel 1 (
  start "%TITLE%" /D "%ROOT%" cmd /k node "%ROOT%scripts\serve-local.js" %PORT% .
  goto open_browser
)

echo.
echo Impossible de lancer le serveur local automatiquement.
echo.
echo Installe Python ou Node.js, puis relance ce fichier :
echo   - Python : https://www.python.org/downloads/
echo   - Node.js : https://nodejs.org/
echo.
pause
exit /b 1

:open_browser
timeout /t 2 /nobreak >nul
start "" "%URL%"

exit /b 0
