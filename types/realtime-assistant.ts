// 🔧 Tipos TypeScript para Asistente Telefónico Conversacional

/**
 * Parámetro de una herramienta HTTP
 */
export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'integer';
  description: string;
  required: boolean;
}

/**
 * Herramienta HTTP que puede ser invocada por el asistente telefónico
 */
export interface HttpTool {
  name: string;
  description: string;
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  parameters: ToolParameter[];
  authentication?: {
    type: 'api_key' | 'bearer' | 'basic';
    key?: string;
    header?: string;
  };
}

/**
 * Solicitud para invocar el asistente telefónico
 */
export interface PhoneCallRequest {
  usuario: string;
  telefono: string;
  timeout: number;
  proposito: string; // Para qué es la llamada
  contexto?: string; // Contexto adicional sobre el tema
  herramientas: HttpTool[]; // Tools que puede usar el asistente telefónico
}

/**
 * Respuesta del asistente telefónico al invocar una llamada
 */
export interface PhoneCallResponse {
  success: boolean;
  callId: string;
  message: string;
  estimatedDuration?: number;
}

/**
 * Respuesta conversacional del asistente tras completar la llamada
 */
export interface ConversationResult {
  callId: string;
  usuario: string;
  telefono: string;
  status: 'completed' | 'failed' | 'timeout' | 'cancelled';
  duration: number; // en segundos
  resumen_conversacion: string; // Resumen natural de lo que se habló
  resultado_accion?: string; // Qué se logró o decidió en la llamada
  informacion_obtenida?: Record<string, any>; // Datos estructurados extraídos
  transcripcion?: ConversationTurn[]; // Transcripción completa opcional
  metadata?: {
    startTime: string;
    endTime: string;
    quality: 'excellent' | 'good' | 'fair' | 'poor';
    interruptions: number;
  };
}

/**
 * Turno de conversación en la transcripción
 */
export interface ConversationTurn {
  timestamp: string;
  speaker: 'assistant' | 'user';
  message: string;
}

/**
 * Estado de una llamada en curso
 */
export interface CallStatus {
  callId: string;
  status: 'pending' | 'ringing' | 'in_progress' | 'completed' | 'failed' | 'timeout' | 'cancelled';
  startTime?: string;
  duration?: number;
  lastUpdate: string;
  usuario: string;
  telefono: string;
  proposito: string;
}

/**
 * Configuración para el cliente del asistente telefónico
 */
export interface PhoneClientConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  retries: number;
  mcpCallbackUrl: string;
}

/**
 * Resultado de procesamiento de respuesta conversacional
 */
export interface ConversationProcessingResult {
  success: boolean;
  callId: string;
  processed: boolean;
  response_for_user: string; // Respuesta que Claude debe dar al usuario
  actions_taken?: string[]; // Acciones tomadas si las hubo
  errors?: string[];
}

/**
 * Métricas de llamadas telefónicas
 */
export interface CallMetrics {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageDuration: number;
  callsByStatus: Record<CallStatus['status'], number>;
  dailyStats: {
    date: string;
    calls: number;
    successRate: number;
    averageDuration: number;
  }[];
  topPurposes: {
    proposito: string;
    count: number;
  }[];
}

/**
 * Error personalizado para operaciones del asistente telefónico
 */
export class PhoneAssistantError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'PhoneAssistantError';
  }
}

/**
 * Configuración de autenticación para el MCP
 */
export interface McpAuthConfig {
  apiKey: string;
  allowedIps?: string[];
  jwtSecret?: string;
  tokenExpiration?: number;
}

/**
 * Log de evento del sistema
 */
export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  component: 'mcp' | 'phone' | 'callback' | 'client';
  action: string;
  details: any;
  userId?: string;
  callId?: string;
} 