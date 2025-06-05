// Test script to debug authentication issues
import { spawn } from 'child_process';

// Configurar las variables de entorno necesarias
process.env.PLANKA_BASE_URL = "https://goyo.sytes.net/planka";
process.env.PLANKA_AGENT_EMAIL = "admin@goyo.sytes.net";
process.env.PLANKA_AGENT_PASSWORD = "RBaeEtnsjBR79SVMspYpUn3H";
process.env.MCP_SERVER_TYPE = "stdio";

console.log("Testing authentication with debug logging...");
console.log("PLANKA_BASE_URL:", process.env.PLANKA_BASE_URL);
console.log("PLANKA_AGENT_EMAIL:", process.env.PLANKA_AGENT_EMAIL);

// Crear proceso hijo para ejecutar el servidor MCP
const serverProcess = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: process.env
});

// Variable para almacenar si ya enviamos el mensaje
let messageSent = false;

// Manejar la salida estándar del proceso
serverProcess.stdout.on('data', (data) => {
  console.log(`[STDOUT] ${data}`);
});

// Manejar la salida de error del proceso (donde van los console.error del servidor)
serverProcess.stderr.on('data', (data) => {
  console.log(`[STDERR] ${data}`);
  
  // Cuando vemos que el servidor está listo, enviamos una petición que requiera autenticación
  if (data.toString().includes('MCP Server connected and ready') && !messageSent) {
    messageSent = true;
    console.log("\nServer is ready, sending get_projects request...");
    
    // Enviar mensaje para obtener proyectos (esto debería triggear la autenticación)
    const testMessage = JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'mcp_kanban_project_board_manager',
        arguments: {
          action: 'get_projects',
          page: 1,
          perPage: 10
        }
      },
      id: 1
    }) + '\n';
    
    console.log("Sending message:", testMessage);
    serverProcess.stdin.write(testMessage);
    
    // Cerrar el servidor después de un tiempo
    setTimeout(() => {
      console.log("\nTest completed, closing server...");
      serverProcess.kill();
      process.exit(0);
    }, 8000);
  }
});

// Manejar errores del proceso
serverProcess.on('error', (error) => {
  console.error(`Process error: ${error}`);
  process.exit(1);
});

// Manejar cierre del proceso
serverProcess.on('close', (code) => {
  console.log(`Server process closed with code: ${code}`);
});

// Timeout de seguridad
setTimeout(() => {
  console.log("Timeout reached, killing process...");
  serverProcess.kill();
  process.exit(1);
}, 15000); 