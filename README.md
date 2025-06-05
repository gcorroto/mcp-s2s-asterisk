# 📞 MCP Asistente Telefónico Conversacional

Un MCP (Model Context Protocol) real que permite a Claude realizar llamadas telefónicas conversacionales automatizadas y recibir respuestas procesadas.

## 🎯 ¿Qué hace?

Este MCP hace que **hablar por teléfono sea más fácil que escribir**. Claude puede:

1. **Iniciar llamadas telefónicas** a usuarios específicos
2. **Especificar el propósito** de la conversación (confirmar cita, consulta médica, etc.)
3. **Recibir un resumen conversacional** de lo que se habló
4. **Obtener datos estructurados** extraídos de la conversación

## 🔄 Flujo de Funcionamiento

```
Claude → MCP → Asistente Telefónico → Usuario (Teléfono)
   ↑                              ↓
   └── Respuesta conversacional ←──┘
```

1. **Claude** utiliza herramientas MCP para solicitar llamadas
2. **MCP** envía la petición al asistente telefónico
3. **Asistente telefónico** llama al usuario y mantiene la conversación
4. **Asistente telefónico** procesa la conversación y envía resultado al MCP
5. **Claude** recibe una respuesta conversacional natural con los resultados

## 🚀 Inicio Rápido

### 1. Configuración

```bash
# Copiar configuración de ejemplo
cp config.example.env .env

# Editar las URLs según tu entorno
# PHONE_API_URL=http://192.168.4.44:8000
# MCP_CALLBACK_URL=http://localhost:3000
```

### 2. Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Compilar
npm run build

# Ejecutar MCP
npm run start-node
```

### 3. Configurar en Cursor

Agregar al archivo `mcp.json` de Cursor:

```json
{
  "mcpServers": {
    "phone-assistant": {
      "command": "node",
      "args": ["C:/workspaces/work_grec0ai/handout-mcp/dist/index.js"],
      "env": {
        "PHONE_API_URL": "http://192.168.4.44:8000",
        "PHONE_API_KEY": "phone-secret-key",
        "MCP_CALLBACK_URL": "http://localhost:3000"
      }
    }
  }
}
```

## 💬 Uso desde Claude

### Realizar una llamada

```javascript
await phone_make_call({
  usuario: "Goyo",
  telefono: "100", 
  proposito: "Confirmar cita médica de mañana",
  contexto: "El usuario tiene una cita médica programada para mañana a las 10:00"
});
```

### Obtener el resultado

```javascript
await phone_get_last_result({
  callId: "call_123"
});
```

**Respuesta típica:**
```
📞 **Llamada completada con Goyo**

💬 **Resumen de la conversación:**
El usuario confirmó que la cita del martes está bien programada y llegará puntual.

✅ **Resultado:**
Cita confirmada para el martes a las 10:00

📋 **Información obtenida:**
- **fecha_cita:** 2024-01-09
- **hora_cita:** 10:00
- **confirmado:** true

⏱️ **Duración:** 45 segundos
📊 **Estado:** Exitosa
```

## 🛠️ Herramientas MCP Disponibles

| Herramienta | Descripción |
|-------------|-------------|
| `phone_make_call` | Realizar una llamada telefónica |
| `phone_get_status` | Obtener estado de una llamada |
| `phone_cancel_call` | Cancelar una llamada en curso |
| `phone_get_metrics` | Obtener métricas del sistema |
| `phone_get_conversation_history` | Ver historial de conversaciones |
| `phone_get_active_calls` | Ver llamadas activas |
| `phone_health_check` | Verificar estado del sistema |
| `phone_get_logs` | Obtener logs del sistema |
| `phone_get_last_result` | Obtener último resultado de una llamada |

## 🔧 Configuración del Asistente Telefónico

El asistente telefónico debe:

1. **Recibir peticiones** en `http://192.168.4.44:8000/call`
2. **Realizar la llamada** al usuario especificado
3. **Procesar la conversación** según el propósito
4. **Enviar resultado** al MCP usando la herramienta HTTP proporcionada

### Ejemplo de herramienta HTTP automática

El MCP automáticamente proporciona al asistente telefónico una herramienta para devolver resultados:

```json
{
  "name": "responder_al_mcp",
  "description": "Envía el resultado de la conversación telefónica de vuelta al MCP",
  "endpoint": "http://localhost:3000/api/phone/conversation-result",
  "method": "POST",
  "parameters": [
    {
      "name": "callId",
      "type": "string",
      "description": "ID único de la llamada",
      "required": true
    },
    {
      "name": "resumen_conversacion", 
      "type": "string",
      "description": "Resumen natural y conversacional de lo que se habló",
      "required": true
    },
    {
      "name": "resultado_accion",
      "type": "string", 
      "description": "Qué se logró o decidió en la llamada",
      "required": false
    },
    {
      "name": "informacion_obtenida",
      "type": "string",
      "description": "Información estructurada extraída (JSON string)",
      "required": false
    }
  ],
  "authentication": {
    "type": "api_key",
    "header": "X-MCP-API-Key",
    "key": "mcp-secret-key"
  }
}
```

## 📊 Métricas y Monitoreo

El sistema registra automáticamente:
- Total de llamadas realizadas
- Tasa de éxito
- Duración promedio
- Propósitos más comunes
- Logs detallados de todas las operaciones

## 🎯 Casos de Uso

- **Confirmación de citas médicas**
- **Recordatorios personalizados** 
- **Consultas de servicio al cliente**
- **Encuestas de satisfacción**
- **Soporte técnico básico**
- **Cualquier conversación que sea más cómoda que escribir**

## 🔄 Protocolo MCP

Este es un MCP real que sigue el protocolo estándar:

- **Transporte stdio** para comunicación con Claude/Cursor
- **Herramientas separadas** para cada función
- **Respuestas formateadas** en texto natural
- **Sin endpoints HTTP personalizados** (MCP puro)

## 🤝 Contribuir

Este proyecto está diseñado para ser **simple y extensible**. Las principales áreas de mejora son:

1. **Persistencia en base de datos** (actualmente en memoria)
2. **Más herramientas HTTP personalizadas** para diferentes industrias
3. **Mejores métricas y analytics**
4. **Integración con calendarios y CRMs**

---

**¡Haz que las conversaciones telefónicas sean tan fáciles como un prompt!** 📞✨ 