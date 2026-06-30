# Rapida.ai Node.js Recipes

The **Rapida.ai Node.js SDK** provides an efficient way to integrate Rapida.ai's services into your applications. This library includes examples and use cases to help you get started quickly.

## Installation

Add the Rapida.ai Node.js SDK to your project by running:

```sh
npm install @rapidaai/nodejs
```

For other language SDKs, visit the documentation link below.

## Documentation

Comprehensive documentation for the SDK can be found here:
[Rapida.ai Documentation](https://doc.rapida.ai/introduction/overview)

## Contact

If you have questions or need support, feel free to reach out to **Prashant at `prashant@rapida.ai`**.

## Use Cases and Examples

Below are some common use cases of the SDK with examples:

| **Use Case**                  | **Command**                           | **Description**                                  |
|-------------------------------|---------------------------------------|------------------------------------------------|
| Make a single phone call      | `node call/make-phone-call.js`        | Example script for initiating a single call    |
| Make a bulk phone call        | `node call/make-bulk-phone-calls.js`  | Example script for making bulk phone calls     |
| Assistant management          | `node assistant/index.js`             | Examples for getting assistants, conversations, webhooks, tools, knowledge, and analysis |
| Endpoint management           | `node endpoint/index.js`              | Examples for invoking endpoints and managing endpoint logs |
| AgentKit server               | `node agentkit/index.js`              | Example gRPC server for hosting a custom AgentKit voice agent |
| AgentKit v2 server            | `node agentkit/v2.js`                 | Minimal AgentKit server using per-conversation `Agent` classes |
| AgentKit v2 first user        | `node agentkit/v2-first-user.js`      | AgentKit server that injects the first user message during initialization |

Refer to the example scripts provided in the SDK repository to understand how to implement these use cases.

## AgentKit Server Example

The AgentKit example hosts a bidirectional gRPC server that responds to Rapida conversation streams. It acknowledges initialization/configuration messages, echoes text user messages, ends the conversation when the user says `disconnect`, and sends a text response for audio messages.

```bash
# Optional. Defaults to 50051.
export AGENTKIT_PORT=50051

# Optional. Enables AgentKit middleware that checks the authorization metadata key.
export AGENTKIT_TOKEN=<shared-token>

# Optional. Enables a separate HTTP health endpoint for Kubernetes httpGet probes.
export AGENTKIT_HTTP_HEALTH_PORT=8080
export AGENTKIT_HTTP_HEALTH_HOST=0.0.0.0
export AGENTKIT_HTTP_HEALTH_PATH=/healthz

node agentkit/index.js
```

Register the server address as the AgentKit provider URL for your assistant deployment. If you use `AGENTKIT_TOKEN`, configure Rapida to send the same token as gRPC metadata using the `authorization` key.

For Kubernetes, use the standard gRPC health probe on the same port:

```yaml
ports:
  - name: grpc
    containerPort: 50051
livenessProbe:
  grpc:
    port: 50051
readinessProbe:
  grpc:
    port: 50051
```

If your cluster requires HTTP probes, set `AGENTKIT_HTTP_HEALTH_PORT` to expose
a separate HTTP health endpoint. HTTP probes cannot share the AgentKit gRPC
port in `grpc-js`.

This example requires a version of `@rapidaai/nodejs` that includes the AgentKit exports.

## AgentKit V2 Server Example

The v2 example keeps application code focused on user messages and assistant replies. The SDK creates one `Agent` instance for each incoming conversation, so per-conversation state can live on `this.state`.

```bash
export AGENTKIT_PORT=50051
export AGENTKIT_TOKEN=<shared-token>

node agentkit/v2.js
```

The agent receives user messages through lifecycle methods:

```js
class EchoAgent extends Agent {
  async onUser(user) {
    await this.reply(`You said: ${user.text}`);
  }
}

const server = new AgentKitServer({
  agent: Agent.runner({
    default: EchoAgent,
    agents: [
      {
        assistantId: "asst_support",
        version: "v1",
        agent: EchoAgent,
      },
    ],
  }),
});
```

## AgentKit V2 First User Example

Use this example when the AgentKit server should create the first user turn on
behalf of the conversation, before Rapida sends a user message.

```bash
export AGENTKIT_PORT=50051
export AGENTKIT_FIRST_USER_MESSAGE="The user has joined and needs support."
export AGENTKIT_FIRST_ASSISTANT_MESSAGE="Hi, I am here. How can I help?"

node agentkit/v2-first-user.js
```

The example sends `sendUser(...)` from `onInitialization(...)`, then sends the
first assistant message explicitly:

```js
import { randomUUID } from "crypto";

class FirstUserAgent extends Agent {
  async onInitialization() {
    const messageId = `agentkit-user-${randomUUID()}`;

    await this.sendUser({
      id: messageId,
      text: "The user has joined the conversation.",
      completed: true,
    });

    await this.sendAssistant({
      id: messageId,
      text: "Hi, I am here. How can I help you today?",
      completed: true,
    });
  }
}
```

## Regression / Automation Tests

Run all APIs end-to-end against your real account and validate every response:

```bash
# Required
export RAPIDA_PROJECT_CREDENTIAL=<your-api-key>

npm test
# or: node tests/index.js
```

Optional env vars:

| Variable | Default | Description |
|---|---|---|
| `RAPIDA_RUN_INVOKE` | `false` | Set to `true` to run the Invoke test (costs LLM credits) |
| `RAPIDA_RUN_CALLS` | `false` | Set to `true` to place real phone calls |
| `RAPIDA_TO_NUMBER` | — | Destination number (E.164) required when `RAPIDA_RUN_CALLS=true` |

The suite runs **step by step**, auto-discovers IDs from list calls, and prints a pass/fail/skip summary. Exits with code `1` if any test fails — CI-friendly.

---

For more updates and guidance, revisit the official documentation and stay tuned for new releases!

### Contribute

Have a new use case in mind? Feel free to add it and create a Pull Request (PR)! We appreciate your contributions. Happy contributing! 🚀
