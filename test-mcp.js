const { spawn } = require('child_process');

// Test the MCP server by spawning it with environment variables
const child = spawn('node', ['dist/index.js'], {
  env: {
    ...process.env,
    PLANKA_API_URL: 'http://localhost:3000',
    PLANKA_TOKEN: 'test_token'
  },
  stdio: ['pipe', 'pipe', 'pipe']
});

console.log('Starting MCP server test...');

child.stderr.on('data', (data) => {
  console.log('STDERR:', data.toString());
});

child.stdout.on('data', (data) => {
  console.log('STDOUT:', data.toString());
});

child.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

child.on('error', (error) => {
  console.error('Error starting server:', error);
});

// Send a simple test message after a short delay
setTimeout(() => {
  console.log('Sending test message to server...');
  child.stdin.write(JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: {
        name: "test-client",
        version: "1.0.0"
      }
    }
  }) + '\n');
}, 1000);

// Close after 5 seconds
setTimeout(() => {
  console.log('Terminating server...');
  child.kill();
}, 5000);
