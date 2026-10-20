@echo off
setlocal

rem Check if mvn is available in PATH
where mvn >nul 2>nul
if %ERRORLEVEL% equ 0 (
    mvn %*
    exit /b %ERRORLEVEL%
)

rem Fallback to detected Maven in user profile
set "FALLBACK_MVN=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.12\59fe215c0ad6947fea90184bf7add084544567b927287592651fda3782e0e798\bin\mvn.cmd"
if exist "%FALLBACK_MVN%" (
    call "%FALLBACK_MVN%" %*
    exit /b %ERRORLEVEL%
)

echo [ERROR] No se encontro Maven en el sistema ni en .m2.
echo Por favor instale Maven o agregue 'mvn' al PATH de Windows.
exit /b 1
