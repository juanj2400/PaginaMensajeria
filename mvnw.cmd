@echo off
pushd "%~dp0backend"
call mvnw.cmd %*
set ERR=%ERRORLEVEL%
popd
exit /b %ERR%
