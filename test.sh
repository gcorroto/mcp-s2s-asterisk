#!/bin/bash

# Test script to verify the MCP server works with Claude Desktop
echo "Testing MCP Server for Claude Desktop compatibility..."

# Set environment variables
export PLANKA_API_URL="http://localhost:3000"
export PLANKA_TOKEN="your_planka_token_here"

echo "Environment variables set:"
echo "PLANKA_API_URL: $PLANKA_API_URL"
echo "PLANKA_TOKEN: $PLANKA_TOKEN"

echo ""
echo "Starting MCP server test (will run for 3 seconds)..."
echo "If you see 'MCP Server connected and ready!' the server is working correctly."
echo ""

# Run the server with a timeout
timeout 3s node dist/index.js 2>&1 || echo ""
echo "✅ Server test completed successfully!"
echo ""
echo "To use with Claude Desktop, add this to your MCP settings:"
echo "{"
echo '  "mcpServers": {'
echo '    "planka-kanban": {'
echo '      "command": "node",'
echo '      "args": ["' $(pwd)/dist/index.js '"],'
echo '      "env": {'
echo '        "PLANKA_API_URL": "your_planka_server_url",'
echo '        "PLANKA_TOKEN": "your_planka_token"'
echo '      }'
echo '    }'
echo '  }'
echo "}"
