// 📞 Cliente HTTP para Asistente Telefónico Conversacional

import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import {
  PhoneClientConfig,
  PhoneCallRequest,
  PhoneCallResponse,
  CallStatus,
  PhoneAssistantError,
  HttpTool
} from '../types/realtime-assistant.js';

/**
 * Cliente para interactuar con la API del Asistente Telefónico
 */
export class PhoneClient {
  private client: AxiosInstance;
  private config: PhoneClientConfig;

  constructor(config: PhoneClientConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.apiKey,
        'User-Agent': 'MCP-PhoneAssistant/1.0'
      }
    });

    // Interceptor para manejo de errores
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => this.handleAxiosError(error)
    );
  }

  /**
   * Invocar al asistente telefónico para realizar una llamada conversacional
   */
  async makePhoneCall(request: PhoneCallRequest): Promise<PhoneCallResponse> {
    try {
      console.log(`🔄 Iniciando llamada telefónica a: ${request.usuario} (${request.telefono})`);
      console.log(`📋 Propósito: ${request.proposito}`);
      
      // Construir la herramienta HTTP para el callback del MCP
      const mcpCallbackTool = this.buildMcpCallbackTool();
      
      // Agregar la herramienta de callback a las herramientas existentes
      const requestWithCallback = {
        ...request,
        herramientas: [...request.herramientas, mcpCallbackTool]
      };

      const response = await this.client.post('/call', requestWithCallback);
      
      console.log(`✅ Llamada telefónica iniciada. CallId: ${response.data.callId}`);
      
      return {
        success: true,
        callId: response.data.callId || this.generateCallId(),
        message: response.data.message || 'Llamada telefónica iniciada correctamente',
        estimatedDuration: response.data.estimatedDuration
      };
    } catch (error) {
      console.error('❌ Error al iniciar llamada telefónica:', error);
      throw this.createPhoneError('CALL_FAILED', 'Error al iniciar la llamada telefónica', error);
    }
  }

  /**
   * Obtener el estado de una llamada
   */
  async getCallStatus(callId: string): Promise<CallStatus> {
    try {
      const response = await this.client.get(`/call/${callId}/status`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error al obtener estado de llamada ${callId}:`, error);
      throw this.createPhoneError('STATUS_FAILED', 'Error al obtener estado de llamada', error);
    }
  }

  /**
   * Cancelar una llamada en curso
   */
  async cancelCall(callId: string): Promise<boolean> {
    try {
      await this.client.post(`/call/${callId}/cancel`);
      console.log(`🚫 Llamada ${callId} cancelada`);
      return true;
    } catch (error) {
      console.error(`❌ Error al cancelar llamada ${callId}:`, error);
      throw this.createPhoneError('CANCEL_FAILED', 'Error al cancelar llamada', error);
    }
  }

  /**
   * Construir la herramienta HTTP para el callback del MCP
   */
  private buildMcpCallbackTool(): HttpTool {
    return {
      name: 'responder_al_mcp',
      description: 'Envía el resultado de la conversación telefónica de vuelta al MCP',
      endpoint: `${this.config.mcpCallbackUrl}/api/phone/conversation-result`,
      method: 'POST',
      parameters: [
        {
          name: 'callId',
          type: 'string',
          description: 'ID único de la llamada',
          required: true
        },
        {
          name: 'usuario',
          type: 'string',
          description: 'Nombre del usuario que recibió la llamada',
          required: true
        },
        {
          name: 'telefono',
          type: 'string',
          description: 'Número de teléfono llamado',
          required: true
        },
        {
          name: 'status',
          type: 'string',
          description: 'Estado final de la llamada (completed, failed, timeout, cancelled)',
          required: true
        },
        {
          name: 'duration',
          type: 'number',
          description: 'Duración de la llamada en segundos',
          required: true
        },
        {
          name: 'resumen_conversacion',
          type: 'string',
          description: 'Resumen natural y conversacional de lo que se habló',
          required: true
        },
        {
          name: 'resultado_accion',
          type: 'string',
          description: 'Qué se logró o decidió en la llamada',
          required: false
        },
        {
          name: 'informacion_obtenida',
          type: 'string',
          description: 'Información estructurada extraída (JSON string)',
          required: false
        },
        {
          name: 'transcripcion',
          type: 'string',
          description: 'Transcripción completa en JSON si está disponible',
          required: false
        },
        {
          name: 'metadata',
          type: 'string',
          description: 'Metadatos adicionales en JSON',
          required: false
        }
      ],
      authentication: {
        type: 'api_key',
        header: 'X-MCP-API-Key',
        key: process.env.MCP_CALLBACK_API_KEY || 'mcp-default-key'
      }
    };
  }

  /**
   * Generar un ID único para la llamada
   */
  private generateCallId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `call_${timestamp}_${random}`;
  }

  /**
   * Manejar errores de Axios
   */
  private handleAxiosError(error: AxiosError): never {
    if (error.response) {
      // El servidor respondió con un código de error
      throw this.createPhoneError(
        `HTTP_${error.response.status}`,
        `Error HTTP ${error.response.status}: ${error.response.statusText}`,
        error.response.data
      );
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      throw this.createPhoneError(
        'NO_RESPONSE',
        'No se pudo conectar con el asistente telefónico',
        error.message
      );
    } else {
      // Error en la configuración de la petición
      throw this.createPhoneError(
        'REQUEST_ERROR',
        'Error en la configuración de la petición',
        error.message
      );
    }
  }

  /**
   * Crear un error personalizado del asistente telefónico
   */
  private createPhoneError(code: string, message: string, details?: any): PhoneAssistantError {
    return new PhoneAssistantError(message, code, details);
  }

  /**
   * Realizar reintentos con backoff exponencial
   */
  async withRetry<T>(operation: () => Promise<T>, maxRetries: number = this.config.retries): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          break;
        }
        
        const delay = Math.pow(2, attempt) * 1000; // Backoff exponencial
        console.log(`⏱️ Reintento ${attempt}/${maxRetries} en ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  /**
   * Validar la conectividad con el asistente telefónico
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      console.error('❌ Health check falló:', error);
      return false;
    }
  }

  /**
   * Obtener métricas del asistente telefónico
   */
  async getMetrics(): Promise<any> {
    try {
      const response = await this.client.get('/metrics');
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener métricas:', error);
      throw this.createPhoneError('METRICS_FAILED', 'Error al obtener métricas', error);
    }
  }
} 