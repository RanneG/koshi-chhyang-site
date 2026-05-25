@echo off
cd /d "%~dp0"
where python3 >nul 2>&1 && set PY=python3 || set PY=python
netstat -ano | findstr ":8768 " >nul 2>&1
if %errorlevel%==0 (
  echo Port 8768 already in use. Opening earth palette...
  start "" "http://localhost:8768/?palette=earth"
  start "" "http://localhost:8768/heritage.html?palette=earth"
  exit /b 0
)
echo Earth palette experiment ^(shop stays black ^& white^)
echo Home:      http://localhost:8768/?palette=earth
echo Our story: http://localhost:8768/heritage.html?palette=earth
echo Shop B+W:  http://localhost:8768/collection.html?palette=earth
start "" "http://localhost:8768/?palette=earth"
%PY% -m http.server 8768
