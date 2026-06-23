@echo off
REM One-click launcher for "The Climb"
set "PATH=%USERPROFILE%\nodejs;%PATH%"
cd /d "%~dp0"
echo Starting The Climb...  (this window runs the app - keep it open)
echo Opening http://localhost:5180 in your browser shortly.
start "" /min cmd /c "timeout /t 4 >nul & start http://localhost:5180"
call "%USERPROFILE%\nodejs\npm.cmd" run dev
