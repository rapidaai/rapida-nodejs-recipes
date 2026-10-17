import { randomUUID } from "crypto";

import {
  Agent,
  AgentKitServer,
} from "@rapidaai/nodejs";

const port = Number(process.env.AGENTKIT_PORT || 50051);


class FirstUserAgent extends Agent {
  async onInitialization(initialization) {
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

  currentMessageContext = {
    messageId: null,
  };

  async onInterruption(interruption) {
    console.log("Received interruption", interruption);
  }

  async onUser(user) {
    console.log("Received user message", {
      contextId: user.contextId,
      messageId: user.id,
      userText: user.text,
      ctx: this.contextId,
    });

    const contextId = this.contextId;
    const messageId = user.id;
    if (this.currentMessageContext.messageId !== messageId) {
      console.log(
        `[${contextId}][${messageId}] :: Aborting Message for ${this.currentMessageContext.messageId}`,
      );
    }
    const text = user.text?.trim();


    this.currentMessageContext = { messageId };
    if (text?.toLowerCase() === "disconnect") {
      await this.endConversation({
        reason: "user_requested_disconnect",
      });
      return;
    }

    await this.reply({
      id: user.id,
      text: user.text,
      completed: true
    })
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

console.log(`AgentKit first-user example listening on ${server.address}`);
console.log("Register this URL in your AgentKit assistant provider deployment.");

async function shutdown() {
  console.log("Stopping AgentKit first-user example...");
  await server.stop();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
