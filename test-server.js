// Test script to verify the MCP server works correctly
import { exec } from 'child_process';
import fetch from 'node-fetch';

// Configurar las variables de entorno necesarias
process.env.PLANKA_BASE_URL = "https://goyo.sytes.net/planka";
process.env.PLANKA_AGENT_EMAIL = "admin@goyo.sytes.net";
process.env.PLANKA_AGENT_PASSWORD = "RBaeEtnsjBR79SVMspYpUn3H";

console.log("Configuración de variables de entorno:");
console.log("PLANKA_BASE_URL:", process.env.PLANKA_BASE_URL);
console.log("PLANKA_AGENT_EMAIL:", process.env.PLANKA_AGENT_EMAIL);
console.log("PLANKA_AGENT_PASSWORD:", "***");

// Probar el servidor en modo HTTP
async function testHttpServer() {
  console.log("\n--- Probando servidor MCP en modo HTTP ---");
  
  // Iniciar el servidor en modo HTTP
  process.env.MCP_SERVER_TYPE = "http";
  process.env.MCP_HTTP_PORT = "3001";
  
  console.log("Iniciando servidor MCP en modo HTTP en el puerto 3001...");
  
  const server = await import('./dist/index.js');
  
  // Esperar a que el servidor esté listo
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    // Probar el endpoint de estado
    console.log("Probando endpoint /status...");
    const statusResponse = await fetch('http://localhost:3001/status');
    const statusData = await statusResponse.json();
    console.log("Respuesta de /status:", statusData);
    
    // Probar el endpoint MCP
    console.log("Probando endpoint /mcp...");
    const mcpResponse = await fetch('http://localhost:3001/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'ping',
        params: {},
        id: 1
      })
    });
    const mcpData = await mcpResponse.json();
    console.log("Respuesta de /mcp:", mcpData);
    
    console.log("Pruebas HTTP completadas con éxito");
  } catch (error) {
    console.error("Error en las pruebas HTTP:", error);
  }
}

// Ejecutar pruebas
testHttpServer().then(() => {
  console.log("\nPruebas completadas.");
}).catch(error => {
  console.error("Error en las pruebas:", error);
});
