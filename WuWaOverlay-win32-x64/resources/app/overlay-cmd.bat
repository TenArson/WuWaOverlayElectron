@echo off
setlocal
cd /d "%~dp0"
rem Relayer les arguments à l'app Electron (première instance les traitera via requestSingleInstanceLock)
"%~dp0node_modules\.bin\electron.cmd" . -- %*
endlocal

