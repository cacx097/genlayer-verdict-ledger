@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 22 or newer is required.
  pause
  exit /b 1
)
echo Open http://127.0.0.1:5179/ in a browser after the server starts.
node web-server.mjs
if errorlevel 1 pause
