/**
 * Integration tests for the Asterisk S2S MCP Server
 *
 * This test suite tests the MCP tools provided by the phone assistant server.
 * 
 * Note: These tests require proper environment variables:
 * - PHONE_API_URL
 * - PHONE_API_KEY  
 * - MCP_CALLBACK_URL
 */

import { describe, expect, test, beforeAll, afterAll } from "@jest/globals";

// Import phone assistant tools
import * as phoneTools from "../tools/realtime-assistant.js";

// Test configuration
const testTimeout = 30000; // 30 seconds

// Mock environment variables for testing
beforeAll(() => {
  process.env.PHONE_API_URL = process.env.PHONE_API_URL || "http://localhost:8000";
  process.env.PHONE_API_KEY = process.env.PHONE_API_KEY || "test-api-key";
  process.env.MCP_CALLBACK_URL = process.env.MCP_CALLBACK_URL || "http://localhost:3000";
});

describe("Asterisk S2S MCP Server Integration Tests", () => {
  
  describe("Environment Setup", () => {
    test("should have required environment variables", () => {
      expect(process.env.PHONE_API_URL).toBeDefined();
      expect(process.env.PHONE_API_KEY).toBeDefined();
      expect(process.env.MCP_CALLBACK_URL).toBeDefined();
    });
  });

  describe("Health Check", () => {
    test("should perform health check", async () => {
      const result = await phoneTools.healthCheck();
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('phoneAssistant');
      expect(result).toHaveProperty('activeCalls');
      
      // Status should be either 'healthy' or 'unhealthy'
      expect(['healthy', 'unhealthy']).toContain(result.status);
      expect(typeof result.activeCalls).toBe('number');
    }, testTimeout);
  });

  describe("Metrics", () => {
    test("should get call metrics", async () => {
      const result = await phoneTools.getCallMetrics();
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('totalCalls');
      expect(result).toHaveProperty('successfulCalls');
      expect(result).toHaveProperty('failedCalls');
      expect(result).toHaveProperty('successRate');
      expect(result).toHaveProperty('averageDuration');
      expect(result).toHaveProperty('topPurposes');
      
      expect(typeof result.totalCalls).toBe('number');
      expect(typeof result.successfulCalls).toBe('number');
      expect(typeof result.failedCalls).toBe('number');
      expect(typeof result.successRate).toBe('number');
      expect(typeof result.averageDuration).toBe('number');
      expect(Array.isArray(result.topPurposes)).toBe(true);
    }, testTimeout);
  });

  describe("Active Calls", () => {
    test("should get active calls", async () => {
      const result = await phoneTools.getActiveCalls();
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      // Each active call should have proper structure
      result.forEach(call => {
        expect(call).toHaveProperty('callId');
        expect(call).toHaveProperty('usuario');
        expect(call).toHaveProperty('telefono');
        expect(call).toHaveProperty('status');
        expect(call).toHaveProperty('proposito');
      });
    }, testTimeout);
  });

  describe("Conversation History", () => {
    test("should get conversation history", async () => {
      const result = await phoneTools.getConversationHistory({ limit: 5 });
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      // Each conversation should have proper structure
      result.forEach(conversation => {
        expect(conversation).toHaveProperty('callId');
        expect(conversation).toHaveProperty('success');
        expect(conversation).toHaveProperty('response_for_user');
      });
    }, testTimeout);
  });

  describe("System Logs", () => {
    test("should get system logs", async () => {
      const result = await phoneTools.getSystemLogs({
        limit: 10,
        level: 'info'
      });
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      // Each log entry should have proper structure
      result.forEach(log => {
        expect(log).toHaveProperty('timestamp');
        expect(log).toHaveProperty('level');
        expect(log).toHaveProperty('component');
        expect(log).toHaveProperty('action');
        expect(log).toHaveProperty('details');
        
        expect(['info', 'warn', 'error', 'debug']).toContain(log.level);
        expect(['mcp', 'phone', 'callback', 'client']).toContain(log.component);
      });
    }, testTimeout);
  });

  describe("Call Status", () => {
    test("should handle non-existent call status", async () => {
      const result = await phoneTools.getCallStatus({ callId: 'non-existent-call' });
      
      // Should return null or undefined for non-existent calls
      expect(result).toBeNull();
    }, testTimeout);
  });

  describe("Last Conversation Result", () => {
    test("should handle non-existent conversation result", async () => {
      const result = await phoneTools.getLastConversationResult({ callId: 'non-existent-call' });
      
      expect(result).toBeDefined();
      if (result) {
        expect(result).toHaveProperty('found');
        expect(result.found).toBe(false);
      }
    }, testTimeout);
  });

  // Skip actual phone call tests in CI/CD environments
  describe.skip("Phone Call Operations", () => {
    test("should make a phone call", async () => {
      const result = await phoneTools.makePhoneCall({
        usuario: "Test User",
        telefono: "123456789",
        proposito: "Integration test call",
        contexto: "This is a test call for integration testing",
        timeout: 10
      });
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('callId');
      expect(result).toHaveProperty('message');
      expect(typeof result.callId).toBe('string');
      expect(typeof result.message).toBe('string');
    }, testTimeout);
  });

  afterAll(async () => {
    // Cleanup any test artifacts if needed
    console.log("Integration tests completed");
    
    // Allow time for cleanup
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  });
});
