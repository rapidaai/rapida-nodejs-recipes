import { randomUUID } from "crypto";

import {
  Agent,
  AgentKitServer,
  type AgentInitialization,
  type AgentUserMessage,
} from "@rapidaai/nodejs";

const port = Number(process.env.AGENTKIT_PORT || 50051);

class FirstUserAgent extends Agent {
  async onInitialization(initialization: AgentInitialization): Promise<void> {
    const messageId = `agentkit-user-${randomUUID()}`;
    const userText =
      process.env.AGENTKIT_FIRST_USER_MESSAGE ||
      "The user has joined the conversation and is waiting for help.";

    console.log("Pushing first user message", {
      contextId: initialization.contextId,
      messageId,
      userText,
    });

    // sendUser injects a user-message packet into Rapida. It does not call
    // onUser again in this Agent instance, so send the assistant response here.
    await this.sendUser({
      id: messageId,
      text: userText,
      completed: true,
    });

    await this.sendAssistant({
      id: messageId,
      text:
        process.env.AGENTKIT_FIRST_ASSISTANT_MESSAGE ||
        "Hi, I am here. How can I help you today?",
      completed: true,
    });
  }

  async onUser(user: AgentUserMessage): Promise<void> {
    const text = user.text?.trim();

    if (text?.toLowerCase() === "disconnect") {
      await this.endConversation({
        reason: "user_requested_disconnect",
      });
      return;
    }

    await this.reply(text ? `You said: ${text}` : "Audio received.");
  }
}

const server = new AgentKitServer({
  agent: Agent.runner({
    default: FirstUserAgent,
    agents: [
      {
        assistantId: process.env.AGENTKIT_ASSISTANT_ID || "asst_first_user",
        version: process.env.AGENTKIT_ASSISTANT_VERSION || "v1",
        agent: FirstUserAgent,
      },
    ],
  }),
  port,
});

await server.start();

console.log(`AgentKit first-user TypeScript example listening on ${server.address}`);
console.log("Register this URL in your AgentKit assistant provider deployment.");

async function shutdown(): Promise<void> {
  console.log("Stopping AgentKit first-user TypeScript example...");
  await server.stop();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
