import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express from "express";
import { Request, Response } from "express";

import { z } from "zod";

// Import Phone Assistant operations
import * as phoneAssistant from "./operations/realtime-assistant.js";

// Import Phone Assistant tools
import * as phoneTools from "./tools/realtime-assistant.js";

// Import authentication middleware
import {
  authenticate,
  requestLogger,
  validateJsonPayload,
  errorHandler,
  enableCors,
  rateLimit
} from "./middleware/auth.js";

import { VERSION } from "./common/version.js";

// Create the MCP Server with proper configuration
const server = new McpServer({
  name: "phone-assistant-mcp-server",
  version: VERSION,
});

// ----- PHONE ASSISTANT TOOL -----

// Tool principal para asistente telefónico conversacional
server.tool(
  "mcp_phone_assistant",
  "Realizar llamadas telefónicas conversacionales automatizadas",
  {
    action: z
      .enum([
        "make_call",
        "get_status", 
        "cancel",
        "get_metrics",
        "get_history",
        "get_active_calls",
        "health_check",
        "get_logs",
        "get_last_result"
      ])
      .describe("La acción a realizar"),
    // Parámetros para make_call
    usuario: z.string().optional().describe("Nombre del usuario a llamar"),
    telefono: z.string().optional().describe("Número de teléfono del usuario"),
    proposito: z.string().optional().describe("Propósito específico de la llamada"),
    contexto: z.string().optional().describe("Contexto adicional sobre el tema a tratar"),
    timeout: z.number().optional().default(40).describe("Timeout de la llamada en segundos"),
    herramientas_personalizadas: z.string().optional().describe("Herramientas HTTP personalizadas en formato JSON"),
    // Parámetros para otras acciones
    callId: z.string().optional().describe("ID de la llamada"),
    limit: z.number().optional().describe("Límite de resultados"),
    level: z.enum(["info", "warn", "error", "debug"]).optional().describe("Nivel de log"),
    component: z.enum(["mcp", "phone", "callback", "client"]).optional().describe("Componente del sistema")
  },
  async (args) => {
    let result;

    switch (args.action) {
      case "make_call":
        if (!args.usuario || !args.telefono || !args.proposito) {
          throw new Error("usuario, telefono y proposito son requeridos para make_call");
        }
        
        result = await phoneTools.makePhoneCall({
          usuario: args.usuario,
          telefono: args.telefono,
          proposito: args.proposito,
          contexto: args.contexto,
          timeout: args.timeout || 40,
          herramientas_personalizadas: args.herramientas_personalizadas
        });
        break;

      case "get_status":
        if (!args.callId) {
          throw new Error("callId es requerido para get_status");
        }
        result = await phoneTools.getCallStatus({ callId: args.callId });
        break;

      case "cancel":
        if (!args.callId) {
          throw new Error("callId es requerido para cancel");
        }
        result = await phoneTools.cancelCall({ callId: args.callId });
        break;

      case "get_metrics":
        result = await phoneTools.getCallMetrics();
        break;

      case "get_history":
        result = await phoneTools.getConversationHistory({ limit: args.limit });
        break;

      case "get_active_calls":
        result = await phoneTools.getActiveCalls();
        break;

      case "health_check":
        result = await phoneTools.healthCheck();
        break;

      case "get_logs":
        result = await phoneTools.getSystemLogs({
          limit: args.limit,
          level: args.level,
          component: args.component
        });
        break;

      case "get_last_result":
        if (!args.callId) {
          throw new Error("callId es requerido para get_last_result");
        }
        result = await phoneTools.getLastConversationResult({ callId: args.callId });
        break;

      default:
        throw new Error(`Acción desconocida: ${args.action}`);
    }

    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  }
);

async function createServer() {
  // Create a new server instance with proper metadata
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
  
  return server;
}

async function startStdioServer() {
  try {
    console.error("Starting Phone Assistant MCP Server in stdio mode...");
    
    // Create transport
    const transport = new StdioServerTransport();
    
    console.error("Connecting server to transport...");
    
    // Connect server to transport - this should keep the process alive
    await server.connect(transport);
    
    console.error("MCP Server connected and ready!");
    console.error("Available tools:", [
      "mcp_phone_assistant"
    ]);
    
  } catch (error) {
    console.error("Error starting stdio server:", error);
    console.error("Stack trace:", (error as Error).stack);
    process.exit(1);
  }
}

async function startHttpServer(port = 3000) {
  try {
    console.error("Starting Phone Assistant MCP Server in HTTP mode...");
    
    const app = express();
    
    // Middleware básico
    app.use(enableCors);
    app.use(requestLogger);
    app.use(express.json());
    app.use(validateJsonPayload);
    app.use(rateLimit(20, 60000)); // 20 requests per minute
    
    // ----- PHONE ASSISTANT ENDPOINTS -----
    
    // Endpoint principal para recibir resultados de conversaciones telefónicas
    app.post('/api/phone/conversation-result', authenticate, async (req: Request, res: Response) => {
      try {
        console.log('📞 Resultado de conversación recibido del asistente telefónico');
        
        const conversationResult = req.body;
        const result = await phoneAssistant.processConversationResult(conversationResult);
        
        res.status(200).json({
          success: true,
          result
        });
      } catch (error) {
        console.error('❌ Error procesando resultado de conversación:', error);
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Error interno'
        });
      }
    });
    
    // Endpoint para confirmar información (herramienta básica)
    app.post('/api/phone/confirm-info', authenticate, async (req: Request, res: Response) => {
      try {
        console.log('✅ Información confirmada durante llamada');
        
        // Procesar confirmación de información
        // Esta es una herramienta básica que puede usar el asistente telefónico
        const { callId, tipo_informacion, datos, usuario_confirmo } = req.body;
        
        // Log de la confirmación
        console.log(`📋 Tipo: ${tipo_informacion}, Confirmado: ${usuario_confirmo}, CallId: ${callId}`);
        
        res.status(200).json({
          success: true,
          message: 'Información confirmada correctamente',
          callId,
          tipo_informacion,
          confirmed: usuario_confirmo
        });
      } catch (error) {
        console.error('❌ Error procesando confirmación:', error);
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Error interno'
        });
      }
    });
    
    // Endpoint para health check del asistente telefónico
    app.get('/api/phone/health', async (_req: Request, res: Response) => {
      try {
        const health = await phoneAssistant.healthCheck();
        res.status(health.status === 'healthy' ? 200 : 503).json(health);
      } catch (error) {
        res.status(503).json({
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Error interno'
        });
      }
    });
    
    // Endpoint para obtener métricas
    app.get('/api/phone/metrics', async (_req: Request, res: Response) => {
      try {
        const metrics = phoneAssistant.getCallMetrics();
        res.status(200).json(metrics);
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Error interno'
        });
      }
    });
    
    // Endpoint para obtener llamadas activas
    app.get('/api/phone/calls/active', async (_req: Request, res: Response) => {
      try {
        const activeCalls = phoneAssistant.getActiveCalls();
        res.status(200).json(activeCalls);
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Error interno'
        });
      }
    });
    
    // Endpoint para obtener historial de conversaciones
    app.get('/api/phone/conversations/history', async (req: Request, res: Response) => {
      try {
        const limit = parseInt(req.query.limit as string) || 50;
        const history = phoneAssistant.getConversationHistory(limit);
        res.status(200).json(history);
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Error interno'
        });
      }
    });
    
    // Endpoint para obtener logs del sistema
    app.get('/api/phone/logs', async (req: Request, res: Response) => {
      try {
        const limit = parseInt(req.query.limit as string) || 100;
        const logs = phoneAssistant.getSystemLogs(limit);
        res.status(200).json(logs);
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Error interno'
        });
      }
    });
    
    // Endpoint para cancelar una llamada
    app.post('/api/phone/calls/:callId/cancel', authenticate, async (req: Request, res: Response) => {
      try {
        const { callId } = req.params;
        const success = await phoneAssistant.cancelCall(callId);
        
        res.status(200).json({
          success,
          message: success ? 'Llamada cancelada' : 'No se pudo cancelar la llamada'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Error interno'
        });
      }
    });
    
    // Add a status endpoint
    app.get('/status', (_req: Request, res: Response) => {
      res.status(200).json({
        status: 'ok',
        server: 'phone-assistant-mcp-server',
        version: VERSION,
        features: ['phone-calls', 'conversational-ai']
      });
    });
    
    // Error handler middleware (debe ir al final)
    app.use(errorHandler);
    
    // Start the server
    app.listen(port, () => {
      console.error(`Phone Assistant MCP Server listening on port ${port}`);
      console.error(`Status endpoint available at http://localhost:${port}/status`);
      console.error(`Phone Assistant endpoints:`);
      console.error(`  - POST /api/phone/conversation-result`);
      console.error(`  - POST /api/phone/confirm-info`);
      console.error(`  - GET  /api/phone/health`);
      console.error(`  - GET  /api/phone/metrics`);
      console.error(`  - GET  /api/phone/calls/active`);
      console.error(`  - GET  /api/phone/conversations/history`);
      console.error(`  - GET  /api/phone/logs`);
      console.error(`  - POST /api/phone/calls/:callId/cancel`);
    });
    
  } catch (error) {
    console.error("Error starting HTTP server:", error);
    console.error("Stack trace:", (error as Error).stack);
    process.exit(1);
  }
}

async function runServer() {
  try {
    // Create the server
    await createServer();
    
    // Determine server type based on environment variables
    const serverType = process.env.MCP_SERVER_TYPE || 'stdio';
    const httpPort = parseInt(process.env.MCP_HTTP_PORT || '3000', 10);
    
    if (serverType === 'http') {
      await startHttpServer(httpPort);
    } else {
      await startStdioServer();
    }
    
  } catch (error) {
    console.error("Error starting server:", error);
    console.error("Stack trace:", (error as Error).stack);
    process.exit(1);
  }
}

// Start the server
runServer();
