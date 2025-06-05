// 🔐 Middleware de Autenticación para MCP

import { Request, Response, NextFunction } from 'express';
import { McpAuthConfig } from '../types/realtime-assistant.js';

// Configuración de autenticación
const authConfig: McpAuthConfig = {
  apiKey: process.env.MCP_CALLBACK_API_KEY || 'mcp-default-key',
  allowedIps: process.env.MCP_ALLOWED_IPS?.split(',') || [],
  jwtSecret: process.env.MCP_JWT_SECRET || 'mcp-secret-key',
  tokenExpiration: parseInt(process.env.MCP_TOKEN_EXPIRATION || '3600') // 1 hora por defecto
};

/**
 * Middleware para validar API Key
 */
export function validateApiKey(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-mcp-api-key'] as string;
  
  if (!apiKey) {
    res.status(401).json({
      error: 'API Key requerida',
      code: 'MISSING_API_KEY'
    });
    return;
  }
  
  if (apiKey !== authConfig.apiKey) {
    res.status(403).json({
      error: 'API Key inválida',
      code: 'INVALID_API_KEY'
    });
    return;
  }
  
  next();
}

/**
 * Middleware para validar IP permitidas
 */
export function validateAllowedIps(req: Request, res: Response, next: NextFunction): void {
  // Si no hay IPs configuradas, permitir todas
  if (!authConfig.allowedIps || authConfig.allowedIps.length === 0) {
    next();
    return;
  }
  
  const clientIp = getClientIp(req);
  
  if (!authConfig.allowedIps.includes(clientIp)) {
    console.warn(`🚫 IP no autorizada: ${clientIp}`);
    res.status(403).json({
      error: 'IP no autorizada',
      code: 'FORBIDDEN_IP',
      ip: clientIp
    });
    return;
  }
  
  console.log(`✅ IP autorizada: ${clientIp}`);
  next();
}

/**
 * Middleware combinado para autenticación completa
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  // Log de la petición
  console.log(`🔍 Auth check: ${req.method} ${req.path} from ${getClientIp(req)}`);
  
  // Validar IP primero
  validateAllowedIps(req, res, (ipError) => {
    if (ipError) return;
    
    // Luego validar API Key
    validateApiKey(req, res, (keyError) => {
      if (keyError) return;
      
      // Log de autenticación exitosa
      console.log(`🔓 Autenticación exitosa para ${req.path}`);
      next();
    });
  });
}

/**
 * Middleware para validar que la petición viene del asistente realtime
 */
export function validateRealtimeAssistant(req: Request, res: Response, next: NextFunction): void {
  const userAgent = req.headers['user-agent'] as string;
  const expectedAgent = 'RealtimeAssistant';
  
  if (!userAgent || !userAgent.includes(expectedAgent)) {
    console.warn(`🚫 User-Agent inválido: ${userAgent}`);
    res.status(403).json({
      error: 'Petición no autorizada',
      code: 'INVALID_USER_AGENT'
    });
    return;
  }
  
  next();
}

/**
 * Middleware para rate limiting básico
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(maxRequests: number = 10, windowMs: number = 60000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIp = getClientIp(req);
    const now = Date.now();
    
    // Limpiar contadores expirados
    for (const [ip, data] of requestCounts.entries()) {
      if (now > data.resetTime) {
        requestCounts.delete(ip);
      }
    }
    
    // Obtener o crear contador para esta IP
    let ipData = requestCounts.get(clientIp);
    if (!ipData || now > ipData.resetTime) {
      ipData = { count: 0, resetTime: now + windowMs };
      requestCounts.set(clientIp, ipData);
    }
    
    // Incrementar contador
    ipData.count++;
    
    // Verificar límite
    if (ipData.count > maxRequests) {
      console.warn(`🚫 Rate limit excedido para IP: ${clientIp}`);
      res.status(429).json({
        error: 'Demasiadas peticiones',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((ipData.resetTime - now) / 1000)
      });
      return;
    }
    
    // Agregar headers informativos
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': (maxRequests - ipData.count).toString(),
      'X-RateLimit-Reset': new Date(ipData.resetTime).toISOString()
    });
    
    next();
  };
}

/**
 * Middleware para logging de requests
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const clientIp = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'Unknown';
  
  console.log(`📥 ${req.method} ${req.path} - IP: ${clientIp} - UA: ${userAgent}`);
  
  // Log de respuesta
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusEmoji = res.statusCode >= 400 ? '❌' : '✅';
    console.log(`📤 ${statusEmoji} ${res.statusCode} ${req.method} ${req.path} - ${duration}ms`);
  });
  
  next();
}

/**
 * Middleware para validar formato JSON
 */
export function validateJsonPayload(req: Request, res: Response, next: NextFunction): void {
  if (req.method === 'POST' || req.method === 'PUT') {
    const contentType = req.headers['content-type'];
    
    if (!contentType || !contentType.includes('application/json')) {
      res.status(400).json({
        error: 'Content-Type debe ser application/json',
        code: 'INVALID_CONTENT_TYPE'
      });
      return;
    }
    
    // Verificar que el body fue parseado correctamente
    if (req.body === undefined) {
      res.status(400).json({
        error: 'Body JSON inválido',
        code: 'INVALID_JSON'
      });
      return;
    }
  }
  
  next();
}

/**
 * Middleware para manejo de errores
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  console.error(`💥 Error en ${req.method} ${req.path}:`, err);
  
  // Error de sintaxis JSON
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      error: 'JSON inválido en el body',
      code: 'INVALID_JSON_SYNTAX'
    });
    return;
  }
  
  // Error genérico
  res.status(500).json({
    error: 'Error interno del servidor',
    code: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  });
}

/**
 * Obtener la IP real del cliente
 */
function getClientIp(req: Request): string {
  return (
    req.headers['x-forwarded-for'] as string ||
    req.headers['x-real-ip'] as string ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

/**
 * Middleware para CORS básico
 */
export function enableCors(req: Request, res: Response, next: NextFunction): void {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-MCP-API-Key');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
}

/**
 * Obtener configuración de autenticación actual
 */
export function getAuthConfig(): McpAuthConfig {
  return { ...authConfig };
}

/**
 * Actualizar configuración de autenticación
 */
export function updateAuthConfig(newConfig: Partial<McpAuthConfig>): void {
  Object.assign(authConfig, newConfig);
  console.log('🔧 Configuración de autenticación actualizada');
}

/**
 * Validar token JWT (para uso futuro)
 */
export function validateJwtToken(token: string): { valid: boolean; payload?: any } {
  try {
    // Aquí iría la lógica de validación JWT
    // Por ahora retornamos válido para desarrollo
    return { valid: true, payload: { sub: 'realtime-assistant' } };
  } catch (error) {
    return { valid: false };
  }
}

/**
 * Limpiar datos de rate limiting antiguos (ejecutar periódicamente)
 */
export function cleanupRateLimitData(): void {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [ip, data] of requestCounts.entries()) {
    if (now > data.resetTime) {
      requestCounts.delete(ip);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`🧹 Limpieza de rate limiting: ${cleaned} entradas eliminadas`);
  }
}

// Ejecutar limpieza cada 5 minutos
setInterval(cleanupRateLimitData, 5 * 60 * 1000); 