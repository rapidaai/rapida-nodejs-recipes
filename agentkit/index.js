import {
  AgentKitAgent,
  AgentKitServer,
} from "@rapidaai/nodejs";

/**
 * EchoAgent is the smallest useful AgentKit implementation.
 *
 * AgentKitAgent provides helper methods for:
 * - Detecting incoming TalkInput message types.
 * - Building TalkOutput acknowledgements and assistant responses.
 *
 * Real production agents should replace the echo logic with their own
 * LLM orchestration, tool calls, state management, and error handling.
 */
class EchoAgent extends AgentKitAgent {
  /**
   * The Talk method handles one bidirectional gRPC conversation stream.
   *
   * Rapida sends TalkInput messages on `data`.
   * The agent responds by writing TalkOutput messages back to the same stream.
   */
  talk(call) {
    console.log("AgentKit stream connected");

    call.on("data", (request) => {
      // The initialization message is expected first. Acknowledge it before
      // handling user messages so Rapida knows the agent is ready.
      if (this.isInitializationRequest(request)) {
        const conversationId = this.getConversationId(request);
        const assistantId = this.getAssistantId(request);

        console.log("Conversation initialized", {
          conversationId,
          assistantId,
        });

        call.write(this.initializationResponse(request.getInitialization()));
        return;
      }

      // Configuration updates can change stream mode or related runtime
      // settings. The current protocol uses a plain 200 acknowledgement.
      if (this.isConfigurationRequest(request)) {
        console.log("Conversation configuration received");
        call.write(this.configurationResponse(request.getConfiguration()));
        return;
      }

      // Text user messages are where most application logic starts. This
      // example sends one partial response and one final response.
      if (this.isTextMessage(request)) {
        const messageId = this.getMessageId(request);
        const text = this.getUserText(request);

        console.log("User message received", {
          messageId,
          text,
        });

        call.write(
          this.assistantResponse(
            messageId,
            `You said: ${text}`,
            // completed=false means this is a streaming chunk.
            false
          )
        );
        call.write(
          this.assistantResponse(
            messageId,
            "Thanks, I received your message.",
            // completed=true marks the final assistant response for this turn.
            true
          )
        );
        return;
      }

      // Audio input is detected here, but this example intentionally responds
      // with text. A production voice agent may forward audio to STT or handle
      // audio-native flows before writing TalkOutput messages.
      if (this.isAudioMessage(request)) {
        const messageId = this.getMessageId(request);

        console.log("Audio message received", {
          messageId,
        });

        call.write(
          this.assistantResponse(
            messageId,
            "Audio received. This example only responds with text.",
            true
          )
        );
      }
    });

    // The client has finished sending messages. Close our side of the stream.
    call.on("end", () => {
      console.log("AgentKit stream ended");
      call.end();
    });

    // Log stream-level errors. Production code may also emit telemetry here.
    call.on("error", (error) => {
      console.error("AgentKit stream error", error);
    });
  }
}

// Port defaults to 50051 to match the SDK AgentKit server default.
const port = Number(process.env.AGENTKIT_PORT || 50051);

// If AGENTKIT_TOKEN is set, incoming streams must include matching gRPC
// metadata under the "authorization" key.
const token = process.env.AGENTKIT_TOKEN;

const server = new AgentKitServer({
  agent: new EchoAgent(),
  port,
  authConfig: token
    ? {
        enabled: true,
        token,
      }
    : undefined,
});

await server.start();

console.log(`AgentKit server listening on ${server.address}`);
console.log("Register this URL in your AgentKit assistant provider deployment.");

if (token) {
  console.log("Token auth is enabled. Send it as gRPC metadata: authorization");
}

// Gracefully stop the gRPC server when the process is interrupted.
process.on("SIGINT", async () => {
  console.log("Stopping AgentKit server...");
  await server.stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Stopping AgentKit server...");
  await server.stop();
  process.exit(0);
});
