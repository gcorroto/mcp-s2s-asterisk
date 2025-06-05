#!/bin/bash

# Script de desarrollo para el servidor MCP Planka

echo "Compilando TypeScript..."
npx tsc

if [ $? -eq 0 ]; then
    echo "✅ Compilación exitosa"
    echo "🚀 Iniciando servidor MCP..."
    
    # Establecer variables de entorno por defecto si no están configuradas
    export PLANKA_API_URL=${PLANKA_API_URL:-"http://localhost:3000"}
    export PLANKA_TOKEN=${PLANKA_TOKEN:-"your-token-here"}
    
    echo "📡 Configuración:"
    echo "  PLANKA_API_URL: $PLANKA_API_URL"
    echo "  PLANKA_TOKEN: [PROTECTED]"
    echo ""
    
    node dist/index.js
else
    echo "❌ Error en la compilación TypeScript"
    exit 1
fi
