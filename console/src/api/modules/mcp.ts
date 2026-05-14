import { request } from "../request";
import type {
  MCPClientInfo,
  MCPClientCreateRequest,
  MCPClientUpdateRequest,
} from "../types";

export type MCPOAuthStartBody = {
  url: string;
  scope?: string;
  client_id?: string;
  auth_endpoint?: string;
  token_endpoint?: string;
};

export type MCPOAuthStartResponse = {
  auth_url: string;
  session_id: string;
};

export type MCPOAuthStatusResponse = {
  authorized: boolean;
  expires_at: number;
  scope: string;
};

export const mcpApi = {
  /**
   * List all MCP clients
   */
  listMCPClients: () => request<MCPClientInfo[]>("/mcp"),

  /**
   * Get details of a specific MCP client
   */
  getMCPClient: (clientKey: string) =>
    request<MCPClientInfo>(`/mcp/${encodeURIComponent(clientKey)}`),

  /**
   * Create a new MCP client
   */
  createMCPClient: (body: MCPClientCreateRequest) =>
    request<MCPClientInfo>("/mcp", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /**
   * Update an existing MCP client
   */
  updateMCPClient: (clientKey: string, body: MCPClientUpdateRequest) =>
    request<MCPClientInfo>(`/mcp/${encodeURIComponent(clientKey)}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  /**
   * Toggle MCP client enabled status
   */
  toggleMCPClient: (clientKey: string) =>
    request<MCPClientInfo>(`/mcp/${encodeURIComponent(clientKey)}/toggle`, {
      method: "PATCH",
    }),

  /**
   * Delete an MCP client
   */
  deleteMCPClient: (clientKey: string) =>
    request<{ message: string }>(`/mcp/${encodeURIComponent(clientKey)}`, {
      method: "DELETE",
    }),

  getOAuthStatus: (clientKey: string) =>
    request<MCPOAuthStatusResponse>(
      `/mcp/${encodeURIComponent(clientKey)}/oauth/status`,
    ),

  startOAuth: (clientKey: string, body: MCPOAuthStartBody) =>
    request<MCPOAuthStartResponse>(
      `/mcp/${encodeURIComponent(clientKey)}/oauth/start`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    ),

  revokeOAuth: (clientKey: string) =>
    request<{ message: string }>(
      `/mcp/${encodeURIComponent(clientKey)}/oauth`,
      {
        method: "DELETE",
      },
    ),
};
