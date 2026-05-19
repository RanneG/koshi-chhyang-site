@echo off
cd /d "%~dp0"
echo Open http://localhost:8766/ in your browser
python -m http.server 8766
