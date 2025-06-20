#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Import Phone Assistant tools
import * as phoneTools from "./tools/realtime-assistant.js";

import { VERSION } from "./common/version.js";

// Create the MCP Server with proper configuration
const server = new McpServer({
  name: "phone-assistant-mcp-server",
  version: VERSION,
});

// ----- HERRAMIENTAS MCP PARA ASISTENTE TELEFÓNICO -----

// 1. Realizar llamada telefónica
server.tool(
  "phone_make_call",
  "Realizar una llamada telefónica conversacional automatizada",
  {
    usuario: z.string().describe("Nombre del usuario a llamar"),
    telefono: z.string().describe("Número de teléfono del usuario"),
    proposito: z.string().describe("Propósito específico de la llamada"),
    contexto: z.string().optional().describe("Contexto adicional sobre el tema a tratar"),
    timeout: z.number().optional().default(40).describe("Timeout de la llamada en segundos"),
    herramientas_personalizadas: z.string().optional().describe("Herramientas HTTP personalizadas en formato JSON")
  },
  async (args) => {
    const result = await phoneTools.makePhoneCall({
      usuario: args.usuario,
      telefono: args.telefono,
      proposito: args.proposito,
      contexto: args.contexto,
      timeout: args.timeout || 40,
      herramientas_personalizadas: args.herramientas_personalizadas
    });

    return {
      content: [{ 
        type: "text", 
        text: `📞 Llamada iniciada con ${args.usuario}\n\n**ID de llamada:** ${result.callId}\n**Mensaje:** ${result.message}\n**Duración estimada:** ${result.estimatedDuration || 'No estimada'} segundos`
      }],
    };
  }
);

// 2. Obtener estado de llamada
server.tool(
  "phone_get_status",
  "Obtener el estado actual de una llamada telefónica",
  {
    callId: z.string().describe("ID de la llamada")
  },
  async (args) => {
    const result = await phoneTools.getCallStatus({ callId: args.callId });
    
    if (!result) {
      return {
        content: [{ type: "text", text: `❌ No se encontró la llamada con ID: ${args.callId}` }],
      };
    }

    return {
      content: [{ 
        type: "text", 
        text: `📊 **Estado de llamada ${args.callId}**\n\n**Usuario:** ${result.usuario}\n**Teléfono:** ${result.telefono}\n**Estado:** ${result.status}\n**Propósito:** ${result.proposito}\n**Duración:** ${result.duration || 'N/A'} segundos\n**Última actualización:** ${result.lastUpdate}`
      }],
    };
  }
);

// 3. Cancelar llamada
server.tool(
  "phone_cancel_call",
  "Cancelar una llamada telefónica en curso",
  {
    callId: z.string().describe("ID de la llamada a cancelar")
  },
  async (args) => {
    const result = await phoneTools.cancelCall({ callId: args.callId });

    return {
      content: [{ 
        type: "text", 
        text: result.success 
          ? `✅ ${result.message}` 
          : `❌ ${result.message}`
      }],
    };
  }
);

// 4. Obtener métricas del sistema
server.tool(
  "phone_get_metrics",
  "Obtener métricas y estadísticas del sistema telefónico",
  {},
  async () => {
    const result = await phoneTools.getCallMetrics();

    return {
      content: [{ 
        type: "text", 
        text: `📊 **Métricas del Sistema Telefónico**\n\n**Total de llamadas:** ${result.totalCalls}\n**Llamadas exitosas:** ${result.successfulCalls}\n**Llamadas fallidas:** ${result.failedCalls}\n**Tasa de éxito:** ${result.successRate}%\n**Duración promedio:** ${Math.round(result.averageDuration)} segundos\n\n**Top propósitos:**\n${result.topPurposes.map(p => `- ${p.proposito}: ${p.count} llamadas`).join('\n')}`
      }],
    };
  }
);

// 5. Obtener historial de conversaciones
server.tool(
  "phone_get_conversation_history",
  "Obtener el historial de conversaciones telefónicas recientes",
  {
    limit: z.number().optional().default(10).describe("Número máximo de conversaciones a obtener")
  },
  async (args) => {
    const result = await phoneTools.getConversationHistory({ limit: args.limit });

    if (result.length === 0) {
      return {
        content: [{ type: "text", text: "📭 No hay conversaciones en el historial" }],
      };
    }

    const historyText = result.map(conv => 
      `**${conv.callId}** - ${conv.success ? '✅' : '❌'}\n${conv.response_for_user}\n---`
    ).join('\n\n');

    return {
      content: [{ 
        type: "text", 
        text: `📚 **Historial de Conversaciones (${result.length} últimas)**\n\n${historyText}`
      }],
    };
  }
);

// 6. Obtener llamadas activas
server.tool(
  "phone_get_active_calls",
  "Obtener lista de llamadas telefónicas activas en este momento",
  {},
  async () => {
    const result = await phoneTools.getActiveCalls();

    if (result.length === 0) {
      return {
        content: [{ type: "text", text: "📵 No hay llamadas activas en este momento" }],
      };
    }

    const activeText = result.map(call => 
      `**${call.callId}** - ${call.usuario} (${call.telefono})\n📞 Estado: ${call.status}\n🎯 Propósito: ${call.proposito}\n⏱️ Iniciada: ${call.startTime || 'N/A'}`
    ).join('\n\n');

    return {
      content: [{ 
        type: "text", 
        text: `📞 **Llamadas Activas (${result.length})**\n\n${activeText}`
      }],
    };
  }
);

// 7. Health check del sistema
server.tool(
  "phone_health_check",
  "Verificar el estado de salud del sistema telefónico",
  {},
  async () => {
    const result = await phoneTools.healthCheck();

    const statusIcon = result.status === 'healthy' ? '✅' : '❌';
    const phoneIcon = result.phoneAssistant ? '📞' : '📵';

    return {
      content: [{ 
        type: "text", 
        text: `${statusIcon} **Estado del Sistema: ${result.status.toUpperCase()}**\n\n${phoneIcon} **Asistente telefónico:** ${result.phoneAssistant ? 'Conectado' : 'Desconectado'}\n📊 **Llamadas activas:** ${result.activeCalls}\n🕐 **Verificado:** ${result.timestamp}${result.lastError ? `\n❌ **Último error:** ${result.lastError}` : ''}`
      }],
    };
  }
);

// 8. Obtener logs del sistema
server.tool(
  "phone_get_logs",
  "Obtener logs del sistema telefónico para debugging",
  {
    limit: z.number().optional().default(20).describe("Número máximo de logs a obtener"),
    level: z.enum(["info", "warn", "error", "debug"]).optional().describe("Filtrar por nivel de log"),
    component: z.enum(["mcp", "phone", "callback", "client"]).optional().describe("Filtrar por componente del sistema")
  },
  async (args) => {
    const result = await phoneTools.getSystemLogs({
      limit: args.limit,
      level: args.level,
      component: args.component
    });

    if (result.length === 0) {
      return {
        content: [{ type: "text", text: "📝 No hay logs disponibles con los filtros especificados" }],
      };
    }

    const logsText = result.map(log => {
      const levelIcon = {
        info: 'ℹ️',
        warn: '⚠️', 
        error: '❌',
        debug: '🔍'
      }[log.level] || '📝';
      
      return `${levelIcon} **${log.timestamp}** [${log.component.toUpperCase()}] ${log.action}\n${JSON.stringify(log.details, null, 2)}`;
    }).join('\n\n');

    return {
      content: [{ 
        type: "text", 
        text: `📝 **Logs del Sistema (${result.length} entradas)**\n\n${logsText}`
      }],
    };
  }
);

// 9. Obtener último resultado de conversación
server.tool(
  "phone_get_last_result",
  "Obtener el último resultado procesado de una llamada específica",
  {
    callId: z.string().describe("ID de la llamada")
  },
  async (args) => {
    const result = await phoneTools.getLastConversationResult({ callId: args.callId });

    if (!result || !result.found) {
      return {
        content: [{ type: "text", text: `❌ No se encontró resultado para la llamada: ${args.callId}` }],
      };
    }

    return {
      content: [{ 
        type: "text", 
        text: `📋 **Resultado de llamada ${args.callId}**\n\n${result.response_for_user || 'Sin respuesta'}\n\n**Acciones realizadas:** ${result.actions_taken?.join(', ') || 'Ninguna'}\n**Procesado:** ${result.processed_at || 'No disponible'}`
      }],
    };
  }
);

async function runServer() {
  try {
    console.error("Creating Phone Assistant MCP Server...");
    console.error("Server info: phone-assistant-mcp-server");
    console.error("Version:", VERSION);
    
    // Validate environment variables
    if (!process.env.PHONE_API_URL) {
      console.error("Warning: PHONE_API_URL environment variable not set");
    } else {
      console.error("PHONE_API_URL:", process.env.PHONE_API_URL);
    }
    
    if (!process.env.PHONE_API_KEY) {
      console.error("Warning: PHONE_API_KEY environment variable not set");
    } else {
      console.error("PHONE_API_KEY:", "***");
    }
    
    if (!process.env.MCP_CALLBACK_URL) {
      console.error("Warning: MCP_CALLBACK_URL environment variable not set");
    } else {
      console.error("MCP_CALLBACK_URL:", process.env.MCP_CALLBACK_URL);
    }
    
    console.error("Starting Phone Assistant MCP Server in stdio mode...");
    
    // Create transport
    const transport = new StdioServerTransport();
    
    console.error("Connecting server to transport...");
    
    // Connect server to transport - this should keep the process alive
    await server.connect(transport);
    
    console.error("MCP Server connected and ready!");
    console.error("Available tools:", [
      "phone_make_call",
      "phone_get_status", 
      "phone_cancel_call",
      "phone_get_metrics",
      "phone_get_conversation_history",
      "phone_get_active_calls",
      "phone_health_check",
      "phone_get_logs",
      "phone_get_last_result"
    ]);
    
  } catch (error) {
    console.error("Error starting server:", error);
    console.error("Stack trace:", (error as Error).stack);
    process.exit(1);
  }
}

// Start the server
runServer();
