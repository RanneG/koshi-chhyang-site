@echo off
cd /d "%~dp0"
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":8767" ^| findstr "LISTENING"') do (
  echo Port 8767 already in use. Opening social palette...
  start "" "http://localhost:8767/heritage.html?palette=social"
  start "" "http://localhost:8767/?palette=social"
  pause
  exit /b 0
)
echo Social palette experiment ^(local only — flat colours, no deploy^)
echo Home:       http://localhost:8767/?palette=social
echo Our story:  http://localhost:8767/heritage.html?palette=social
echo Shop:       http://localhost:8767/collection.html?palette=social
echo Red room:   http://localhost:8767/ ^(footer: Red room palette^)
echo Press Ctrl+C to stop.
start "" "http://localhost:8767/heritage.html?palette=social"
python -m http.server 8767
