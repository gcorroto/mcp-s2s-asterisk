// Test script to verify the MCP server works in stdio mode
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configurar las variables de entorno necesarias
process.env.PLANKA_BASE_URL = "https://goyo.sytes.net/planka";
process.env.PLANKA_AGENT_EMAIL = "admin@goyo.sytes.net";
process.env.PLANKA_AGENT_PASSWORD = "RBaeEtnsjBR79SVMspYpUn3H";
process.env.MCP_SERVER_TYPE = "stdio";

console.log("Configuración de variables de entorno:");
console.log("PLANKA_BASE_URL:", process.env.PLANKA_BASE_URL);
console.log("PLANKA_AGENT_EMAIL:", process.env.PLANKA_AGENT_EMAIL);
console.log("PLANKA_AGENT_PASSWORD:", "***");
console.log("MCP_SERVER_TYPE:", process.env.MCP_SERVER_TYPE);

// Ruta al servidor MCP compilado
const serverPath = join(__dirname, 'dist', 'index.js');

console.log("\n--- Probando servidor MCP en modo stdio ---");
console.log("Iniciando servidor MCP en modo stdio...");

// Crear proceso hijo para ejecutar el servidor MCP
const serverProcess = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: process.env
});

// Manejar la salida estándar del proceso
serverProcess.stdout.on('data', (data) => {
  console.log(`Salida del servidor: ${data}`);
});

// Manejar la salida de error del proceso
serverProcess.stderr.on('data', (data) => {
  console.error(`Salida de error del servidor: ${data}`);
});

// Ejemplo de mensaje jsonrpc para probar el servidor
const testMessage = JSON.stringify({
  jsonrpc: '2.0',
  method: 'initialize',
  params: {
    capabilities: {}
  },
  id: 1
}) + '\n';

// Esperar un momento antes de enviar el mensaje
setTimeout(() => {
  console.log("\nEnviando mensaje de inicialización al servidor...");
  console.log(testMessage);
  
  // Enviar mensaje al servidor
  serverProcess.stdin.write(testMessage);
  
  // Cerrar el servidor después de un tiempo
  setTimeout(() => {
    console.log("\nPrueba completada, cerrando servidor...");
    serverProcess.kill();
    process.exit(0);
  }, 5000);
}, 2000);

// Manejar errores del proceso
serverProcess.on('error', (error) => {
  console.error(`Error en el proceso del servidor: ${error}`);
  process.exit(1);
});

// Manejar cierre del proceso
serverProcess.on('close', (code) => {
  console.log(`El proceso del servidor se cerró con código: ${code}`);
}); 