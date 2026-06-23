@echo off
set "PATH=%USERPROFILE%\nodejs;%PATH%"
cd /d "%~dp0"
call "%USERPROFILE%\nodejs\npm.cmd" start
