# ⚠️ Troubleshooting

This page provides solutions to common issues you might encounter when setting up or using Kanban MCP.

## 🔌 Connection Issues

### 🚫 MCP Server Cannot Connect to Planka

**Symptoms:**
- Error messages about connection refused
- Timeout errors when trying to access Planka API
- Errors like `Error: connect ECONNREFUSED`

**Possible Solutions:**
1. **🔍 Check if Planka is running:**
   ```bash
   docker ps | grep planka
   ```
   If Planka is not listed, restart it with `npm run up`

2. **🌐 Verify network configuration:**
   - When running MCP in Docker, use `host.docker.internal` instead of `localhost` in the `PLANKA_BASE_URL`
   - Ensure the port in `PLANKA_BASE_URL` matches the port Planka is running on (default: 3333)
   - For macOS and Windows, `host.docker.internal` resolves to the host machine
   - For Linux, you may need to use `--add-host=host.docker.internal:host-gateway` when running Docker

3. **🔄 Check Docker network:**
   ```bash
   docker network ls
   docker network inspect kanban-mcp_default
   ```
   Ensure the Planka container is properly connected to the network

4. **📝 Verify environment variables:**
   - Double-check the values for `PLANKA_BASE_URL` in your Docker command
   - Ensure environment variables are set with explicit values, not variable references
   ```bash
   # ❌ Don't use variable references
   -e PLANKA_BASE_URL=http://host.docker.internal:${PLANKA_PORT}
   
   # ✅ Use explicit values
   -e PLANKA_BASE_URL=http://host.docker.internal:3333
   ```

### 🔑 Authentication Failures

**Symptoms:**
- "Invalid credentials" errors
- "Unauthorized" errors when MCP tries to access Planka
- Error messages like `Error: Request failed with status code 401`

**Possible Solutions:**
1. **👤 Verify agent credentials:**
   - Double-check that the email and password in your MCP configuration match the agent user created in Planka
   - Try logging into Planka manually with the agent credentials to verify they work
   - Ensure both email and password are correctly specified in environment variables

2. **🔄 Reset agent password:**
   - Log in to Planka as admin
   - Go to user management
   - Reset the agent user's password
   - Update the password in your MCP configuration

3. **🔣 Check for special characters:**
   - If your password contains special characters, ensure they are properly escaped in your configuration
   - Consider using a simpler password for testing purposes

## 🐳 Docker Issues

### 🏗️ Docker Image Build Failures

**Symptoms:**
- Errors during `npm run build-docker`
- Missing dependencies or build errors

**Possible Solutions:**
1. **🧹 Clean and rebuild:**
   ```bash
   # Remove existing images
   docker rmi mcp-kanban:latest
   
   # Clean npm cache and node_modules
   npm cache clean --force
   rm -rf node_modules
   
   # Reinstall dependencies and rebuild
   npm install
   npm run build-docker
   ```

2. **💾 Check Docker disk space:**
   ```bash
   docker system df
   ```
   If disk space is low, clean up unused Docker resources:
   ```bash
   docker system prune -a
   ```

### 🚀 Container Startup Issues

**Symptoms:**
- Container exits immediately after starting
- Error logs showing startup failures

**Possible Solutions:**
1. **📜 Check container logs:**
   ```bash
   docker logs $(docker ps -a | grep mcp-kanban | awk '{print $1}')
   ```

2. **🔍 Run in interactive mode for debugging:**
   ```bash
   docker run -it --rm mcp-kanban:latest /bin/sh
   ```
   This will give you a shell inside the container to investigate issues

3. **🔗 Test network connectivity from inside the container:**
   ```bash
   docker run -it --rm mcp-kanban:latest /bin/sh
   # Inside the container
   ping host.docker.internal
   curl http://host.docker.internal:3333
   ```
   This can help verify if the container can reach your host machine

## 📊 Planka Issues

### 🗄️ Database Connection Errors

**Symptoms:**
- Planka fails to start
- Logs show database connection errors

**Possible Solutions:**
1. **🔍 Check PostgreSQL container:**
   ```bash
   docker ps | grep postgres
   ```
   If not running, check logs:
   ```bash
   docker logs $(docker ps -a | grep postgres | awk '{print $1}')
   ```

2. **🔄 Reset PostgreSQL data:**
   ```bash
   # Stop containers
   npm run down
   
   # Remove PostgreSQL volume
   docker volume rm kanban-mcp_postgres-data
   
   # Start containers again
   npm run up
   ```
   Note: This will delete all Planka data!

### 🖥️ UI Issues

**Symptoms:**
- Planka UI not loading properly
- JavaScript errors in browser console

**Possible Solutions:**
1. **🧹 Clear browser cache:**
   - Press Ctrl+Shift+Delete in your browser
   - Select cache and cookies
   - Clear data

2. **🌐 Try a different browser:**
   - Some browsers may have compatibility issues with Planka

## 🤖 MCP Integration Issues

### 🔄 Claude Cannot Access Kanban Tools

**Symptoms:**
- Claude doesn't recognize kanban commands
- Error messages about MCP server not being available

**Possible Solutions:**
1. **⚙️ Verify MCP configuration:**
   - Check that the MCP server is properly configured in Cursor settings
   - Ensure the Docker command is correct with proper environment variables

2. **🔄 Restart Cursor:**
   - Sometimes a full restart of Cursor is needed after MCP configuration changes

3. **📜 Check MCP logs:**
   - Look for error messages in the Cursor MCP logs
   - Verify that the MCP server is connecting to Planka successfully

### 🔒 Project Access Issues

**Symptoms:**
- Claude can connect to MCP but cannot see projects
- "Access denied" errors when trying to manage cards
- Error messages like `Error: Request failed with status code 403`

**Possible Solutions:**
1. **👥 Check agent permissions:**
   - Ensure the agent user has been added to the project as a manager
   - Verify the agent has the necessary permissions in Planka

2. **🔢 Project ID issues:**
   - Make sure you're using the correct project ID
   - List all available projects to confirm the project exists and is accessible

## 🛑 Common Error Messages and Solutions

### "Error: connect ECONNREFUSED"

This indicates that the MCP server cannot connect to Planka.

**Solution:**
- Ensure Planka is running
- Check the URL and port in `PLANKA_BASE_URL`
- Use `host.docker.internal` instead of `localhost` when running in Docker
- Verify the port is correct and not blocked by a firewall

### "Error: Request failed with status code 401"

This indicates authentication issues.

**Solution:**
- Verify agent credentials (both email and password)
- Check if the agent user exists in Planka
- Reset the agent password if necessary
- Ensure credentials are properly passed as environment variables

### "Error: Request failed with status code 403"

This indicates permission issues.

**Solution:**
- Ensure the agent user has been added to the project
- Check that the agent has manager permissions
- Verify the agent has access to the specific board/list you're trying to access

## 📞 Getting Additional Help

If you're still experiencing issues after trying these troubleshooting steps:

1. **🔍 Check GitHub Issues:**
   - Visit the [Kanban MCP GitHub repository](https://github.com/bradrisse/kanban-mcp/issues)
   - Search for similar issues or create a new one

2. **📊 Gather Diagnostic Information:**
   ```bash
   # Get Docker container status
   docker ps -a
   
   # Get Docker logs
   docker logs $(docker ps -a | grep mcp-kanban | awk '{print $1}')
   docker logs $(docker ps -a | grep planka | awk '{print $1}')
   
   # Get Docker network information
   docker network inspect kanban-mcp_default
   ```

3. **📝 Include Relevant Information When Seeking Help:**
   - Error messages
   - Steps to reproduce the issue
   - Environment details (OS, Docker version, etc.)
   - Configuration (with sensitive information redacted) 