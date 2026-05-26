@echo off
cd /d "%~dp0"
echo.
echo === Koshi Chhyang — import real Instagram comments ===
echo.
if exist ".secrets\session-koshichhyang" (
  echo Found .secrets\session-koshichhyang — fetching comments...
  python scripts\fetch_ig_community_comments.py
  if errorlevel 1 goto manual
  python scripts\merge_community_comments.py
  if errorlevel 1 goto manual
  echo.
  echo Done. Refresh http://localhost:8766/ then commit assets\community-notes.json
  goto end
)
:manual
echo No session file — opening manual import helper...
start "" "%~dp0assets\import-comments.html"
echo.
echo Manual steps:
echo 1. On each @koshichhyang post ^(logged into Instagram^), run Snippet C in DevTools Console.
echo 2. Paste each JSON object into assets\community-comments-export.json ^(array^).
echo 3. Run: python scripts\merge_community_comments.py
echo.
echo Or set up Instaloader session — see docs\COMMUNITY-NOTES-IMPORT.md
:end
pause
