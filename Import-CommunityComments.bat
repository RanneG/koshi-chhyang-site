@echo off
cd /d "%~dp0"
start "" "%~dp0assets\import-comments.html"
echo.
echo 1. On each @koshichhyang post (logged into Instagram), run Snippet C in DevTools.
echo 2. Paste each JSON object into assets\community-comments-export.json
echo 3. Run: python scripts\merge_community_comments.py
echo 4. Refresh http://localhost:8766/
echo.
pause
