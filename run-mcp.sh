#!/bin/bash

# Script para ejecutar el servidor MCP en diferentes modos

# Configurar variables de entorno
export PLANKA_BASE_URL="https://goyo.sytes.net/planka"
export PLANKA_AGENT_EMAIL="admin@goyo.sytes.net"
export PLANKA_AGENT_PASSWORD="RBaeEtnsjBR79SVMspYpUn3H"

# Función para mostrar ayuda
show_help() {
  echo "Uso: ./run-mcp.sh [OPCIÓN]"
  echo "Ejecuta el servidor MCP en diferentes modos."
  echo ""
  echo "Opciones:"
  echo "  stdio    Ejecuta el servidor en modo stdio (por defecto)"
  echo "  http     Ejecuta el servidor en modo HTTP en el puerto 3001"
  echo "  test     Ejecuta los scripts de prueba"
  echo "  help     Muestra esta ayuda"
  echo ""
  echo "Ejemplos:"
  echo "  ./run-mcp.sh stdio"
  echo "  ./run-mcp.sh http"
  echo "  ./run-mcp.sh test"
}

# Verificar si el proyecto está compilado
if [ ! -d "dist" ]; then
  echo "No se encuentra el directorio 'dist'. Compilando el proyecto..."
  npm run build
fi

# Procesar los argumentos
MODE=${1:-stdio}

case "$MODE" in
  stdio)
    echo "Ejecutando servidor MCP en modo stdio..."
    export MCP_SERVER_TYPE=stdio
    node dist/index.js
    ;;
  http)
    echo "Ejecutando servidor MCP en modo HTTP..."
    export MCP_SERVER_TYPE=http
    export MCP_HTTP_PORT=3001
    node dist/index.js
    ;;
  test)
    echo "Ejecutando pruebas del servidor MCP..."
    echo "Prueba de modo HTTP:"
    node test-server.js
    echo ""
    echo "Prueba de modo stdio:"
    node test-stdio.js
    ;;
  help)
    show_help
    ;;
  *)
    echo "Opción desconocida: $MODE"
    show_help
    exit 1
    ;;
esac 