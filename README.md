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

Refer to the example scripts provided in the SDK repository to understand how to implement these use cases.

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