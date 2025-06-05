// 🌐 Operaciones del Asistente Telefónico Conversacional

import { Request, Response } from 'express';
import { PhoneClient } from '../clients/realtime-client.js';
import {
  PhoneCallRequest,
  ConversationResult,
  CallStatus,
  ConversationProcessingResult,
  PhoneClientConfig,
  CallMetrics,
  SystemLog
} from '../types/realtime-assistant.js';

// Estado en memoria para las llamadas (en producción usar base de datos)
const activeCalls = new Map<string, CallStatus>();
const conversationHistory: ConversationProcessingResult[] = [];
const systemLogs: SystemLog[] = [];

// Configuración del cliente telefónico
const clientConfig: PhoneClientConfig = {
  baseUrl: process.env.PHONE_API_URL || 'http://192.168.4.44:8000',
  apiKey: process.env.PHONE_API_KEY || 'phone-secret-key',
  timeout: parseInt(process.env.PHONE_TIMEOUT || '30000'),
  retries: parseInt(process.env.PHONE_RETRIES || '3'),
  mcpCallbackUrl: process.env.MCP_CALLBACK_URL || 'http://localhost:3000'
};

// Cliente telefónico singleton
let phoneClient: PhoneClient | null = null;

/**
 * Obtener instancia del cliente telefónico
 */
function getPhoneClient(): PhoneClient {
  if (!phoneClient) {
    phoneClient = new PhoneClient(clientConfig);
  }
  return phoneClient;
}

/**
 * Invocar al asistente telefónico para una conversación
 */
export async function makePhoneCall(request: PhoneCallRequest): Promise<{
  success: boolean;
  callId: string;
  message: string;
  estimatedDuration?: number;
}> {
  const client = getPhoneClient();
  
  try {
    // Log de la invocación
    const log: SystemLog = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      level: 'info',
      component: 'phone',
      action: 'initiate_call',
      details: {
        usuario: request.usuario,
        telefono: request.telefono,
        proposito: request.proposito,
        timeout: request.timeout,
        herramientasCount: request.herramientas.length
      }
    };
    systemLogs.push(log);

    // Invocar asistente telefónico
    const response = await client.makePhoneCall(request);
    
    // Registrar llamada activa
    const callStatus: CallStatus = {
      callId: response.callId,
      status: 'pending',
      startTime: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      usuario: request.usuario,
      telefono: request.telefono,
      proposito: request.proposito
    };
    
    activeCalls.set(response.callId, callStatus);
    
    return response;
  } catch (error) {
    // Log del error
    const errorLog: SystemLog = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      level: 'error',
      component: 'phone',
      action: 'initiate_call_failed',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        usuario: request.usuario,
        proposito: request.proposito
      }
    };
    systemLogs.push(errorLog);
    
    throw error;
  }
}

/**
 * Obtener estado de una llamada
 */
export async function getCallStatus(callId: string): Promise<CallStatus | null> {
  // Primero verificar en el estado local
  const localStatus = activeCalls.get(callId);
  
  if (!localStatus) {
    return null;
  }
  
  try {
    // Obtener estado actualizado del asistente
    const client = getPhoneClient();
    const remoteStatus = await client.getCallStatus(callId);
    
    // Actualizar estado local
    activeCalls.set(callId, remoteStatus);
    
    return remoteStatus;
  } catch (error) {
    console.warn(`No se pudo obtener estado remoto para ${callId}, usando estado local`);
    return localStatus;
  }
}

/**
 * Cancelar una llamada
 */
export async function cancelCall(callId: string): Promise<boolean> {
  const client = getPhoneClient();
  
  try {
    const success = await client.cancelCall(callId);
    
    if (success) {
      // Actualizar estado local
      const callStatus = activeCalls.get(callId);
      if (callStatus) {
        callStatus.status = 'cancelled';
        callStatus.lastUpdate = new Date().toISOString();
        activeCalls.set(callId, callStatus);
      }
      
      // Log de cancelación
      const log: SystemLog = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        level: 'info',
        component: 'phone',
        action: 'call_cancelled',
        details: { callId },
        callId
      };
      systemLogs.push(log);
    }
    
    return success;
  } catch (error) {
    const errorLog: SystemLog = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      level: 'error',
      component: 'phone',
      action: 'cancel_call_failed',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        callId
      },
      callId
    };
    systemLogs.push(errorLog);
    
    throw error;
  }
}

/**
 * Procesar resultado de conversación telefónica (callback del asistente)
 */
export async function processConversationResult(result: ConversationResult): Promise<ConversationProcessingResult> {
  const { callId, usuario, status, duration, resumen_conversacion, resultado_accion, informacion_obtenida } = result;
  
  try {
    // Log del resultado recibido
    const log: SystemLog = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      level: 'info',
      component: 'callback',
      action: 'conversation_result_received',
      details: {
        callId,
        usuario,
        status,
        duration,
        resumenLength: resumen_conversacion.length,
        hasAction: !!resultado_accion,
        hasInfo: !!informacion_obtenida
      },
      callId
    };
    systemLogs.push(log);

    // Actualizar estado de la llamada
    const callStatus = activeCalls.get(callId);
    if (callStatus) {
      callStatus.status = status;
      callStatus.duration = duration;
      callStatus.lastUpdate = new Date().toISOString();
      activeCalls.set(callId, callStatus);
    }

    // Construir respuesta conversacional para el usuario que invocó el MCP
    let responseForUser = `📞 **Llamada completada con ${usuario}**\n\n`;
    responseForUser += `💬 **Resumen de la conversación:**\n${resumen_conversacion}\n\n`;
    
    if (resultado_accion) {
      responseForUser += `✅ **Resultado:**\n${resultado_accion}\n\n`;
    }
    
    if (informacion_obtenida && Object.keys(informacion_obtenida).length > 0) {
      responseForUser += `📋 **Información obtenida:**\n`;
      for (const [key, value] of Object.entries(informacion_obtenida)) {
        responseForUser += `- **${key}:** ${value}\n`;
      }
      responseForUser += '\n';
    }
    
    responseForUser += `⏱️ **Duración:** ${Math.round(duration)} segundos\n`;
    responseForUser += `📊 **Estado:** ${status === 'completed' ? 'Exitosa' : 'Fallida'}`;

    // Acciones tomadas (simplificadas para conversaciones)
    const actionsTaken: string[] = [];
    
    if (status === 'completed') {
      actionsTaken.push('conversation_completed');
    }
    
    if (resultado_accion) {
      actionsTaken.push('action_achieved');
    }
    
    if (informacion_obtenida && Object.keys(informacion_obtenida).length > 0) {
      actionsTaken.push('information_gathered');
    }
    
    // Resultado del procesamiento
    const processingResult: ConversationProcessingResult = {
      success: true,
      callId,
      processed: true,
      response_for_user: responseForUser,
      actions_taken: actionsTaken
    };
    
    // Guardar en historial
    conversationHistory.push(processingResult);
    
    // Log de procesamiento exitoso
    const successLog: SystemLog = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      level: 'info',
      component: 'callback',
      action: 'conversation_processed',
      details: {
        callId,
        actionsCount: actionsTaken.length,
        actions: actionsTaken,
        responseLength: responseForUser.length
      },
      callId
    };
    systemLogs.push(successLog);
    
    return processingResult;
  } catch (error) {
    // Log del error de procesamiento
    const errorLog: SystemLog = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      level: 'error',
      component: 'callback',
      action: 'conversation_process_failed',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        callId
      },
      callId
    };
    systemLogs.push(errorLog);
    
    const errorResult: ConversationProcessingResult = {
      success: false,
      callId,
      processed: false,
      response_for_user: `❌ Error al procesar la conversación con ${usuario}. Contacta al administrador.`,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
    
    conversationHistory.push(errorResult);
    return errorResult;
  }
}

/**
 * Obtener métricas de llamadas telefónicas
 */
export function getCallMetrics(): CallMetrics {
  const now = new Date();
  const calls = Array.from(activeCalls.values()).concat(
    conversationHistory.map(h => ({
      callId: h.callId,
      status: 'completed' as const,
      lastUpdate: now.toISOString(),
      usuario: '',
      telefono: '',
      proposito: ''
    }))
  );
  
  const totalCalls = calls.length;
  const successfulCalls = calls.filter(c => c.status === 'completed').length;
  const failedCalls = calls.filter(c => c.status === 'failed').length;
  
  const durations = calls.filter(c => c.duration).map(c => c.duration!);
  const averageDuration = durations.length > 0 
    ? durations.reduce((a, b) => a + b, 0) / durations.length 
    : 0;
  
  const callsByStatus = calls.reduce((acc, call) => {
    acc[call.status] = (acc[call.status] || 0) + 1;
    return acc;
  }, {} as Record<CallStatus['status'], number>);
  
  // Stats diarias (últimos 7 días)
  const dailyStats = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayCalls = calls.filter(c => 
      c.lastUpdate.startsWith(dateStr)
    );
    
    const dayDurations = dayCalls.filter(c => c.duration).map(c => c.duration!);
    const dayAvgDuration = dayDurations.length > 0 
      ? dayDurations.reduce((a, b) => a + b, 0) / dayDurations.length 
      : 0;
    
    dailyStats.push({
      date: dateStr,
      calls: dayCalls.length,
      successRate: dayCalls.length > 0 
        ? dayCalls.filter(c => c.status === 'completed').length / dayCalls.length * 100 
        : 0,
      averageDuration: dayAvgDuration
    });
  }
  
  // Top propósitos
  const purposeCounts: Record<string, number> = {};
  calls.forEach(call => {
    if (call.proposito) {
      purposeCounts[call.proposito] = (purposeCounts[call.proposito] || 0) + 1;
    }
  });
  
  const topPurposes = Object.entries(purposeCounts)
    .map(([proposito, count]) => ({ proposito, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  return {
    totalCalls,
    successfulCalls,
    failedCalls,
    averageDuration,
    callsByStatus,
    dailyStats,
    topPurposes
  };
}

/**
 * Obtener logs del sistema
 */
export function getSystemLogs(limit: number = 100): SystemLog[] {
  return systemLogs
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

/**
 * Obtener historial de conversaciones
 */
export function getConversationHistory(limit: number = 50): ConversationProcessingResult[] {
  return conversationHistory
    .slice(-limit)
    .reverse();
}

/**
 * Obtener todas las llamadas activas
 */
export function getActiveCalls(): CallStatus[] {
  return Array.from(activeCalls.values());
}

/**
 * Health check del asistente telefónico
 */
export async function healthCheck(): Promise<{
  status: 'healthy' | 'unhealthy';
  phoneAssistant: boolean;
  activeCalls: number;
  lastError?: string;
}> {
  try {
    const client = getPhoneClient();
    const isHealthy = await client.healthCheck();
    
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      phoneAssistant: isHealthy,
      activeCalls: activeCalls.size
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      phoneAssistant: false,
      activeCalls: activeCalls.size,
      lastError: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Limpiar datos antiguos (llamar periódicamente)
 */
export function cleanup(maxAge: number = 24 * 60 * 60 * 1000): void {
  const now = Date.now();
  
  // Limpiar llamadas activas completadas hace más de maxAge
  for (const [callId, call] of activeCalls.entries()) {
    const callTime = new Date(call.lastUpdate).getTime();
    if (now - callTime > maxAge && ['completed', 'failed', 'cancelled'].includes(call.status)) {
      activeCalls.delete(callId);
    }
  }
  
  // Limpiar logs antiguos
  const maxLogs = 1000;
  if (systemLogs.length > maxLogs) {
    systemLogs.splice(0, systemLogs.length - maxLogs);
  }
  
  // Limpiar historial antiguo
  const maxHistory = 500;
  if (conversationHistory.length > maxHistory) {
    conversationHistory.splice(0, conversationHistory.length - maxHistory);
  }
}

/**
 * Generar ID único
 */
function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Ejecutar limpieza cada hora
setInterval(() => cleanup(), 60 * 60 * 1000); 