@echo off
cd /d "%~dp0"
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":8767" ^| findstr "LISTENING"') do (
  echo Port 8767 is already in use ^(PID %%P^). Close the other preview window or stop that server first.
  echo If it is already serving this repo, open: http://localhost:8767/
  pause
  exit /b 1
)
echo Production site:  http://localhost:8767/
echo Classic backup: http://localhost:8767/legacy/index.html
echo Shop:           http://localhost:8767/collection.html
echo Visit:          http://localhost:8767/visit.html
echo Our story:      http://localhost:8767/heritage.html
echo Press Ctrl+C to stop.
start "" "http://localhost:8767/"
python -m http.server 8767
