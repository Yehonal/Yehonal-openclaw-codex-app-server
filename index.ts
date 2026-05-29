import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { createAgentTools } from "./src/agent-tools.js";
import { resolvePluginSettings } from "./src/config.js";
import { CodexPluginController } from "./src/controller.js";
import { COMMANDS } from "./src/commands.js";
import { INTERACTIVE_NAMESPACE } from "./src/types.js";

function readAgentIdFromSessionKey(sessionKey?: string): string | undefined {
  const normalized = sessionKey?.trim();
  if (!normalized) {
    return undefined;
  }
  const match = /^agent:([^:]+):/i.exec(normalized);
  return match?.[1]?.trim() || undefined;
}

function agentToolsAllowedForContext(
  allowedAgentIds: string[],
  ctx: { agentId?: string; sessionKey?: string } | undefined,
): boolean {
  if (allowedAgentIds.length === 0) {
    return true;
  }
  const agentId = ctx?.agentId?.trim() || readAgentIdFromSessionKey(ctx?.sessionKey);
  return Boolean(agentId && allowedAgentIds.includes(agentId));
}

const plugin = {
  id: "openclaw-codex-app-server",
  name: "OpenClaw Plugin For Codex App Server",
  description: "Independent OpenClaw plugin for the Codex App Server protocol.",
  register(api: OpenClawPluginApi) {
    const settings = resolvePluginSettings(api.pluginConfig);
    const controller = new CodexPluginController(api);

    api.registerService(controller.createService());

    const toolRegistrar = (
      api as OpenClawPluginApi & {
        registerTool?: (tool: unknown, opts?: { name?: string; names?: string[] }) => void;
      }
    ).registerTool;
    if (settings.agentTools.enabled && typeof toolRegistrar === "function") {
      for (const tool of createAgentTools(controller)) {
        toolRegistrar(
          (ctx: { agentId?: string; sessionKey?: string } | undefined) =>
            agentToolsAllowedForContext(settings.agentTools.allowedAgentIds, ctx) ? tool : null,
          { name: tool.name },
        );
      }
    }

    const bindingResolvedHook = (
      api as OpenClawPluginApi & {
        onConversationBindingResolved?: OpenClawPluginApi["onConversationBindingResolved"];
      }
    ).onConversationBindingResolved;
    if (typeof bindingResolvedHook === "function") {
      bindingResolvedHook(async (event) => {
        await controller.handleConversationBindingResolved(event);
      });
    }

    api.on("inbound_claim", async (event) => {
      return await controller.handleInboundClaim(event);
    });

    api.registerInteractiveHandler({
      channel: "telegram",
      namespace: INTERACTIVE_NAMESPACE,
      handler: async (ctx) => {
        await controller.handleTelegramInteractive(ctx);
        return { handled: true };
      },
    });

    api.registerInteractiveHandler({
      channel: "discord",
      namespace: INTERACTIVE_NAMESPACE,
      handler: async (ctx) => {
        await controller.handleDiscordInteractive(ctx);
        return { handled: true };
      },
    });

    for (const [name, description] of COMMANDS) {
      api.registerCommand({
        name,
        description,
        acceptsArgs: true,
        handler: async (ctx) => {
          return await controller.handleCommand(name, ctx);
        },
      });
    }
  },
};

export default plugin;
