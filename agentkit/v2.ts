import {
  Agent,
  AgentControlTypes,
  AgentKitServer,
  Middleware,
  type AgentKitMiddlewareContext,
  type AgentInitialization,
  type AgentUserMessage,
} from "@rapidaai/nodejs";

const port = Number(process.env.AGENTKIT_PORT || 50051);
const httpHealthPort = process.env.AGENTKIT_HTTP_HEALTH_PORT
  ? Number(process.env.AGENTKIT_HTTP_HEALTH_PORT)
  : undefined;
const token = process.env.AGENTKIT_TOKEN;

class AuthMiddleware extends Middleware {
  constructor(private readonly token: string) {
    super();
  }

  handle({ metadataValue }: AgentKitMiddlewareContext): boolean {
    return metadataValue("authorization") === this.token;
  }
}

const httpHealthCheck = httpHealthPort
  ? {
      host: process.env.AGENTKIT_HTTP_HEALTH_HOST || "0.0.0.0",
      port: httpHealthPort,
      path: process.env.AGENTKIT_HTTP_HEALTH_PATH || "/healthz",
    }
  : undefined;

type ConversationTurn = {
  role: "user" | "assistant";
  content: string;
  messageId?: string;
};

/**
 * Agent is per conversation.
 *
 * The SDK creates a new EchoAgent instance for every incoming AgentKit Talk
 * stream, so class fields, `this.state`, `this.contextId`, and active message
 * tracking are isolated from other concurrent conversations.
 */
class EchoAgent extends Agent {
  private readonly history: ConversationTurn[] = [];

  /**
   * Called after Rapida sends the initialization packet.
   *
   * The runner uses this packet to select the Agent class, then exposes the
   * selected assistant metadata on `this.contextId`, `this.assistantId`, and
   * `this.assistantVersion`.
   */
  async onInitialization(initialization: AgentInitialization): Promise<void> {
    await this.event({
      event: "example.conversation.initialized",
      attributes: {
        contextId: initialization.contextId,
        assistantId: initialization.assistantId ?? "",
        assistantVersion: initialization.assistantVersion ?? "",
      },
    });
  }

  /**
   * Called whenever Rapida sends a user message packet.
   *
   * Most custom agents only need this method. Other lifecycle hooks are
   * available on Agent when you need initialization/configuration/tool events.
   */
  async onUser(user: AgentUserMessage): Promise<void> {
    const text = user.text?.trim();

    this.history.push({
      role: "user",
      content: text || "<audio>",
      messageId: user.id,
    });

    console.log("User message received", {
      // contextId is available after initialization and identifies the Rapida
      // assistant conversation for this stream.
      contextId: this.contextId,
      assistantId: this.assistantId,
      assistantVersion: this.assistantVersion,
      messageId: user.id,
      text,
      turns: this.history.length,
    });

    if (text?.toLowerCase() === "disconnect") {
      console.log("Disconnect requested", {
        contextId: this.contextId,
        messageId: user.id,
      });
      await this.endConversation({
        reason: "user_requested_disconnect",
      });
      return;
    }

    if (text?.toLowerCase() === "noninterruptible") {
      console.log("Sending non-interruptible response", {
        contextId: this.contextId,
        messageId: user.id,
      });

      await this.block({ id: user.id, types: [AgentControlTypes.bargeIn] });
      try {
        await this.reply(
          "This response is protected from barge-in until it finishes."
        );
      } finally {
        await this.unblock({ id: user.id, types: [AgentControlTypes.bargeIn] });
      }
      return;
    }

    // Explicit observability is available from any Agent lifecycle method.
    // The SDK also emits automatic lifecycle telemetry unless disabled in
    // Agent.runner({ instrumentation: false }).
    await this.log({
      level: "info",
      message: "User message received",
      attributes: {
        messageId: user.id,
        messageType: text ? "text" : "audio",
      },
    });
    await this.metric({
      name: "example.conversation.turns",
      value: this.history.length,
      description: "Number of user turns handled by this agent instance",
    });

    if (!text) {
      // `reply()` sends an assistant message. Inside onUser it automatically
      // uses the active user message ID so Rapida can correlate the response.
      await this.reply("Audio received. This example replies with text.");
      return;
    }

    const reply = `You said: ${text}`;
    this.history.push({
      role: "assistant",
      content: reply,
      messageId: user.id,
    });

    await this.reply(reply);
  }
}

const server = new AgentKitServer({
  /**
   * Agent.runner adapts per-conversation Agent classes to the AgentKit gRPC
   * service shape expected by AgentKitServer.
   *
   * Use `default` for the fallback agent and `agents` to route by assistant ID
   * and version from the initialization packet. This lets one server host
   * multiple custom agents safely.
   */
  agent: Agent.runner({
    default: EchoAgent,
    agents: [
      {
        assistantId: process.env.AGENTKIT_ASSISTANT_ID || "asst_example",
        version: process.env.AGENTKIT_ASSISTANT_VERSION || "v1",
        agent: EchoAgent,
      },
    ],
  }),
  port,
  // If AGENTKIT_TOKEN is set, incoming streams must send the same value in the
  // `authorization` gRPC metadata key.
  middleware: token ? [new AuthMiddleware(token)] : [],
  httpHealthCheck,
});

await server.start();

console.log(`AgentKit v2 TypeScript server listening on ${server.address}`);
console.log("Register this URL in your AgentKit assistant provider deployment.");

if (server.httpHealthAddress) {
  console.log(`HTTP health check listening on ${server.httpHealthAddress}`);
}

if (token) {
  console.log(
    "AgentKit middleware is enabled. Send matching gRPC metadata: authorization"
  );
}

async function shutdown(): Promise<void> {
  console.log("Stopping AgentKit v2 TypeScript server...");
  // AgentKitServer.stop() gracefully shuts down the gRPC server.
  await server.stop();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
