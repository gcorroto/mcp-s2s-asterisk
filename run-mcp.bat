@echo off
REM Script para ejecutar el servidor MCP en diferentes modos en Windows

REM Configurar variables de entorno
set PLANKA_BASE_URL=http://localhost:3000
set PLANKA_AGENT_EMAIL=demo@demo.demo
set PLANKA_AGENT_PASSWORD=demo

REM Función para mostrar ayuda
:show_help
echo Uso: run-mcp.bat [OPCION]
echo Ejecuta el servidor MCP en diferentes modos.
echo.
echo Opciones:
echo   stdio    Ejecuta el servidor en modo stdio (por defecto)
echo   http     Ejecuta el servidor en modo HTTP en el puerto 3001
echo   test     Ejecuta los scripts de prueba
echo   help     Muestra esta ayuda
echo.
echo Ejemplos:
echo   run-mcp.bat stdio
echo   run-mcp.bat http
echo   run-mcp.bat test
goto :eof

REM Verificar si el proyecto está compilado
if not exist "dist" (
  echo No se encuentra el directorio 'dist'. Compilando el proyecto...
  call npm run build
)

REM Procesar los argumentos
set MODE=%1
if "%MODE%"=="" set MODE=stdio

if "%MODE%"=="stdio" (
  echo Ejecutando servidor MCP en modo stdio...
  set MCP_SERVER_TYPE=stdio
  node dist/index.js
  goto :eof
)

if "%MODE%"=="http" (
  echo Ejecutando servidor MCP en modo HTTP...
  set MCP_SERVER_TYPE=http
  set MCP_HTTP_PORT=3001
  node dist/index.js
  goto :eof
)

if "%MODE%"=="test" (
  echo Ejecutando pruebas del servidor MCP...
  echo Prueba de modo HTTP:
  node test-server.js
  echo.
  echo Prueba de modo stdio:
  node test-stdio.js
  goto :eof
)

if "%MODE%"=="help" (
  call :show_help
  goto :eof
)

echo Opción desconocida: %MODE%
call :show_help
exit /b 1 