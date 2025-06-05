// 🛠️ Tool MCP para Asistente Telefónico Conversacional

import {
  PhoneCallRequest,
  HttpTool,
  ToolParameter
} from '../types/realtime-assistant.js';
import * as phoneOps from '../operations/realtime-assistant.js';

/**
 * Realizar una llamada telefónica conversacional
 */
export async function makePhoneCall(args: {
  usuario: string;
  telefono: string;
  proposito: string;
  contexto?: string;
  timeout?: number;
  herramientas_personalizadas?: string; // JSON string de herramientas adicionales
}): Promise<{
  success: boolean;
  callId: string;
  message: string;
  estimatedDuration?: number;
}> {
  const { usuario, telefono, proposito, contexto, herramientas_personalizadas } = args;
  const timeout = args.timeout || 40;

  // Parsear herramientas personalizadas si se proporcionan
  let herramientasPersonalizadas: HttpTool[] = [];
  if (herramientas_personalizadas) {
    try {
      herramientasPersonalizadas = JSON.parse(herramientas_personalizadas);
    } catch (error) {
      throw new Error(`Error al parsear herramientas personalizadas: ${error instanceof Error ? error.message : 'JSON inválido'}`);
    }
  }

  // Herramientas básicas conversacionales (mínimas)
  const herramientasBasicas: HttpTool[] = [
    // Herramienta para confirmar información obtenida
    {
      name: 'confirmar_informacion',
      description: 'Confirma información importante obtenida durante la conversación',
      endpoint: `${process.env.MCP_CALLBACK_URL || 'http://localhost:3000'}/api/phone/confirm-info`,
      method: 'POST',
      parameters: [
        {
          name: 'callId',
          type: 'string',
          description: 'ID de la llamada',
          required: true
        },
        {
          name: 'tipo_informacion',
          type: 'string',
          description: 'Tipo de información (contacto, cita, preferencia, etc.)',
          required: true
        },
        {
          name: 'datos',
          type: 'string',
          description: 'Datos confirmados en formato JSON',
          required: true
        },
        {
          name: 'usuario_confirmo',
          type: 'boolean',
          description: 'Si el usuario confirmó explícitamente',
          required: true
        }
      ],
      authentication: {
        type: 'api_key',
        header: 'X-MCP-API-Key',
        key: process.env.MCP_CALLBACK_API_KEY || 'mcp-default-key'
      }
    }
  ];

  // Combinar herramientas básicas con personalizadas
  const todasLasHerramientas = [...herramientasBasicas, ...herramientasPersonalizadas];

  // Construir request para el asistente telefónico
  const request: PhoneCallRequest = {
    usuario,
    telefono,
    timeout,
    proposito,
    contexto,
    herramientas: todasLasHerramientas
  };

  // Realizar llamada telefónica
  return await phoneOps.makePhoneCall(request);
}

/**
 * Obtener estado de una llamada
 */
export async function getCallStatus(args: {
  callId: string;
}): Promise<{
  status: string;
  duration?: number;
  lastUpdate: string;
  usuario: string;
  telefono: string;
  proposito: string;
} | null> {
  const { callId } = args;
  
  const status = await phoneOps.getCallStatus(callId);
  
  if (!status) {
    return null;
  }

  return {
    status: status.status,
    duration: status.duration,
    lastUpdate: status.lastUpdate,
    usuario: status.usuario,
    telefono: status.telefono,
    proposito: status.proposito
  };
}

/**
 * Cancelar una llamada en curso
 */
export async function cancelCall(args: {
  callId: string;
}): Promise<{
  success: boolean;
  message: string;
}> {
  const { callId } = args;
  
  try {
    const success = await phoneOps.cancelCall(callId);
    
    return {
      success,
      message: success ? 'Llamada cancelada exitosamente' : 'No se pudo cancelar la llamada'
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido al cancelar llamada'
    };
  }
}

/**
 * Obtener métricas de llamadas telefónicas
 */
export async function getCallMetrics(): Promise<{
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageDuration: number;
  successRate: number;
  dailyStats: Array<{
    date: string;
    calls: number;
    successRate: number;
    averageDuration: number;
  }>;
  topPurposes: Array<{
    proposito: string;
    count: number;
  }>;
}> {
  const metrics = phoneOps.getCallMetrics();
  
  const successRate = metrics.totalCalls > 0 
    ? (metrics.successfulCalls / metrics.totalCalls) * 100 
    : 0;

  return {
    ...metrics,
    successRate: Math.round(successRate * 100) / 100
  };
}

/**
 * Obtener historial de conversaciones recientes
 */
export async function getConversationHistory(args?: {
  limit?: number;
}): Promise<Array<{
  callId: string;
  success: boolean;
  processed: boolean;
  response_for_user: string;
  actions_taken?: string[];
  errors?: string[];
}>> {
  const limit = args?.limit || 20;
  return phoneOps.getConversationHistory(limit);
}

/**
 * Obtener llamadas activas
 */
export async function getActiveCalls(): Promise<Array<{
  callId: string;
  status: string;
  usuario: string;
  telefono: string;
  proposito: string;
  startTime?: string;
  duration?: number;
}>> {
  return phoneOps.getActiveCalls().map(call => ({
    callId: call.callId,
    status: call.status,
    usuario: call.usuario,
    telefono: call.telefono,
    proposito: call.proposito,
    startTime: call.startTime,
    duration: call.duration
  }));
}

/**
 * Health check del sistema telefónico
 */
export async function healthCheck(): Promise<{
  status: 'healthy' | 'unhealthy';
  phoneAssistant: boolean;
  activeCalls: number;
  lastError?: string;
  timestamp: string;
}> {
  const health = await phoneOps.healthCheck();
  
  return {
    ...health,
    timestamp: new Date().toISOString()
  };
}

/**
 * Obtener logs del sistema
 */
export async function getSystemLogs(args?: {
  limit?: number;
  level?: 'info' | 'warn' | 'error' | 'debug';
  component?: 'mcp' | 'phone' | 'callback' | 'client';
}): Promise<Array<{
  id: string;
  timestamp: string;
  level: string;
  component: string;
  action: string;
  details: any;
  callId?: string;
}>> {
  const limit = args?.limit || 50;
  const logs = phoneOps.getSystemLogs(limit * 2); // Obtener más para filtrar

  // Filtrar por nivel y componente si se especifica
  let filteredLogs = logs;
  
  if (args?.level) {
    filteredLogs = filteredLogs.filter(log => log.level === args.level);
  }
  
  if (args?.component) {
    filteredLogs = filteredLogs.filter(log => log.component === args.component);
  }

  return filteredLogs.slice(0, limit);
}

/**
 * Obtener último resultado de conversación procesado para un callId específico
 */
export async function getLastConversationResult(args: {
  callId: string;
}): Promise<{
  found: boolean;
  response_for_user?: string;
  actions_taken?: string[];
  processed_at?: string;
} | null> {
  const { callId } = args;
  
  const history = phoneOps.getConversationHistory(100); // Buscar en historial reciente
  const result = history.find(h => h.callId === callId);
  
  if (!result) {
    return { found: false };
  }
  
  return {
    found: true,
    response_for_user: result.response_for_user,
    actions_taken: result.actions_taken,
    processed_at: new Date().toISOString() // Simplificado
  };
}

/**
 * Crear herramientas HTTP personalizadas para diferentes tipos de conversaciones
 */
export function createCustomToolsForPurpose(purpose: 'consulta_medica' | 'soporte_tecnico' | 'ventas' | 'servicio_cliente'): HttpTool[] {
  const baseUrl = process.env.MCP_CALLBACK_URL || 'http://localhost:3000';
  const apiKey = process.env.MCP_CALLBACK_API_KEY || 'mcp-default-key';

  const scenarios = {
    consulta_medica: [
      {
        name: 'registrar_sintomas',
        description: 'Registra síntomas reportados por el paciente',
        endpoint: `${baseUrl}/api/medical/symptoms`,
        method: 'POST' as const,
        parameters: [
          { name: 'callId', type: 'string' as const, description: 'ID de la llamada', required: true },
          { name: 'sintomas', type: 'string' as const, description: 'Lista de síntomas', required: true },
          { name: 'severidad', type: 'string' as const, description: 'Nivel de severidad (leve, moderado, grave)', required: true },
          { name: 'duracion', type: 'string' as const, description: 'Duración de los síntomas', required: false }
        ],
        authentication: { type: 'api_key' as const, header: 'X-MCP-API-Key', key: apiKey }
      }
    ],
    
    soporte_tecnico: [
      {
        name: 'registrar_problema',
        description: 'Registra el problema técnico reportado',
        endpoint: `${baseUrl}/api/support/issue`,
        method: 'POST' as const,
        parameters: [
          { name: 'callId', type: 'string' as const, description: 'ID de la llamada', required: true },
          { name: 'tipo_problema', type: 'string' as const, description: 'Categoría del problema', required: true },
          { name: 'descripcion', type: 'string' as const, description: 'Descripción detallada', required: true },
          { name: 'prioridad', type: 'string' as const, description: 'Prioridad (baja, media, alta, crítica)', required: true }
        ],
        authentication: { type: 'api_key' as const, header: 'X-MCP-API-Key', key: apiKey }
      }
    ],
    
    ventas: [
      {
        name: 'registrar_interes',
        description: 'Registra el interés del cliente en productos/servicios',
        endpoint: `${baseUrl}/api/sales/interest`,
        method: 'POST' as const,
        parameters: [
          { name: 'callId', type: 'string' as const, description: 'ID de la llamada', required: true },
          { name: 'producto_interes', type: 'string' as const, description: 'Producto de interés', required: true },
          { name: 'nivel_interes', type: 'string' as const, description: 'Nivel de interés (bajo, medio, alto)', required: true },
          { name: 'presupuesto', type: 'string' as const, description: 'Rango de presupuesto', required: false },
          { name: 'timeframe', type: 'string' as const, description: 'Marco temporal para compra', required: false }
        ],
        authentication: { type: 'api_key' as const, header: 'X-MCP-API-Key', key: apiKey }
      }
    ],
    
    servicio_cliente: [
      {
        name: 'registrar_consulta',
        description: 'Registra la consulta o queja del cliente',
        endpoint: `${baseUrl}/api/customer/query`,
        method: 'POST' as const,
        parameters: [
          { name: 'callId', type: 'string' as const, description: 'ID de la llamada', required: true },
          { name: 'tipo_consulta', type: 'string' as const, description: 'Tipo de consulta (queja, sugerencia, consulta)', required: true },
          { name: 'departamento', type: 'string' as const, description: 'Departamento responsable', required: true },
          { name: 'resolucion_requerida', type: 'boolean' as const, description: 'Si requiere seguimiento', required: true }
        ],
        authentication: { type: 'api_key' as const, header: 'X-MCP-API-Key', key: apiKey }
      }
    ]
  };

  return scenarios[purpose];
} 