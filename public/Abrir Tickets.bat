@echo off
rem Abre la aplicacion de tickets en su propia ventana de Microsoft Edge
set "APP=%~dp0index.html"
start "" msedge --app="file:///%APP:\=/%"
