@echo off
title Prism — Servidor Local
cd /d "%~dp0"
echo.
echo  ✦ Iniciando servidor Prism...
echo  Acesse: http://localhost:3000
echo  Para parar: feche esta janela ou pressione Ctrl+C
echo.
node server.js
pause
