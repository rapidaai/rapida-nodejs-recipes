/**
 * Rapida API Regression Test Suite — NodeJS
 *
 * Runs every API call step by step, validating responses and chaining
 * discovered IDs (assistant → conversations → webhooks → …) into later steps.
 *
 * Usage:
 *   RAPIDA_PROJECT_CREDENTIAL=<api-key> node tests/index.js
 *
 * Optional env vars:
 *   RAPIDA_RUN_INVOKE=true   — run the Invoke endpoint test (costs LLM credits)
 *   RAPIDA_RUN_CALLS=true    — run phone-call tests (places real calls!)
 *   RAPIDA_TO_NUMBER=+1...   — destination phone number for call tests
 */

import {
  ConnectionConfig,
  Paginate,
  // Assistants
  GetAllAssistant,
  GetAllAssistantRequest,
  GetAssistant,
  GetAssistantRequest,
  GetAllAssistantConversation,
  GetAllAssistantConversationRequest,
  GetAssistantConversation,
  GetAssistantConversationRequest,
  GetAllAssistantWebhook,
  GetAllAssistantWebhookRequest,
  GetAssistantWebhook,
  GetAssistantWebhookRequest,
  GetAllAssistantWebhookLog,
  GetAllAssistantWebhookLogRequest,
  GetAssistantWebhookLog,
  GetAssistantWebhookLogRequest,
  GetAllAssistantKnowledge,
  GetAllAssistantKnowledgeRequest,
  GetAssistantKnowledge,
  GetAssistantKnowledgeRequest,
  GetAllAssistantTool,
  GetAllAssistantToolRequest,
  GetAssistantTool,
  GetAssistantToolRequest,
  GetAllAssistantAnalysis,
  GetAllAssistantAnalysisRequest,
  GetAssistantAnalysis,
  GetAssistantAnalysisRequest,
  // Endpoints
  GetAllEndpoint,
  GetAllEndpointRequest,
  GetEndpoint,
  GetEndpointRequest,
  GetAllEndpointLog,
  GetAllEndpointLogRequest,
  GetEndpointLog,
  GetEndpointLogRequest,
  Invoke,
  InvokeRequest,
  EndpointDefinition,
  StringToAny,
  // Calls
  CreatePhoneCall,
  CreatePhoneCallRequest,
  AssistantDefinition,
} from "@rapidaai/nodejs";

// ─── ANSI colours ────────────────────────────────────────────────────────────
const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

// ─── Test runner ─────────────────────────────────────────────────────────────
const results = [];
const ctx = {}; // shared state — discovered IDs flow here between steps

async function step(name, fn) {
  const start = Date.now();
  try {
    await fn(ctx);
    const ms = Date.now() - start;
    results.push({ name, status: "pass", ms });
    console.log(`  ${C.green}✓${C.reset} ${name} ${C.gray}(${ms}ms)${C.reset}`);
  } catch (err) {
    const ms = Date.now() - start;
    results.push({ name, status: "fail", ms, error: err.message });
    console.log(`  ${C.red}✗${C.reset} ${name} ${C.gray}(${ms}ms)${C.reset}`);
    console.log(`    ${C.red}↳ ${err.message}${C.reset}`);
  }
}

function skip(name, reason) {
  results.push({ name, status: "skip", reason });
  console.log(
    `  ${C.yellow}−${C.reset} ${name} ${C.gray}[skipped: ${reason}]${C.reset}`
  );
}

// ─── Assertions ──────────────────────────────────────────────────────────────
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function assertOk(response, label) {
  assert(response != null, `${label}: null response`);
  if (!response.getSuccess()) {
    const err = response.getError();
    const msg =
      err?.getHumanmessage?.() ||
      err?.getErrormessage?.() ||
      "API returned failure";
    throw new Error(`${label}: ${msg}`);
  }
  return response.toObject();
}

function paginate(page = 0, size = 10) {
  return new Paginate().setPage(page).setPageSize(size);
}

// ─── Connection ───────────────────────────────────────────────────────────────
const apiKey = process.env.RAPIDA_PROJECT_CREDENTIAL;
if (!apiKey) {
  console.error(
    `${C.red}Error: RAPIDA_PROJECT_CREDENTIAL env var is required${C.reset}`
  );
  process.exit(1);
}

const conn = ConnectionConfig.DefaultConnectionConfig(
  ConnectionConfig.WithSDK({ ApiKey: apiKey })
);

// ─── Assistant tests ─────────────────────────────────────────────────────────
async function runAssistantTests() {
  console.log(`\n${C.bold}${C.cyan}── Assistant API ──${C.reset}`);

  await step("GetAllAssistant", async (ctx) => {
    const req = new GetAllAssistantRequest();
    req.setPaginate(paginate());
    const res = await GetAllAssistant(conn, req);
    const obj = assertOk(res, "GetAllAssistant");
    assert(Array.isArray(obj.data), "data should be an array");
    ctx.assistantId = obj.data[0]?.id;
    ctx.assistantName = obj.data[0]?.name ?? "(unnamed)";
    if (ctx.assistantId) {
      console.log(
        `    ${C.gray}→ discovered assistantId: ${ctx.assistantId} (${ctx.assistantName})${C.reset}`
      );
    }
  });

  if (!ctx.assistantId) {
    for (const name of [
      "GetAssistant",
      "GetAllAssistantConversation",
      "GetAssistantConversation",
      "GetAllAssistantWebhook",
      "GetAssistantWebhook",
      "GetAllAssistantKnowledge",
      "GetAssistantKnowledge",
      "GetAllAssistantTool",
      "GetAssistantTool",
      "GetAllAssistantAnalysis",
      "GetAssistantAnalysis",
    ]) {
      skip(name, "no assistant found in account");
    }
    return;
  }

  await step("GetAssistant", async (ctx) => {
    const req = new GetAssistantRequest();
    req.setId(ctx.assistantId);
    const res = await GetAssistant(conn, req);
    const obj = assertOk(res, "GetAssistant");
    assert(obj.data?.id === ctx.assistantId, "returned assistant ID mismatch");
  });

  // ── Conversations ───────────────────────────────────────────────────────────
  await step("GetAllAssistantConversation", async (ctx) => {
    const req = new GetAllAssistantConversationRequest();
    req.setAssistantId(ctx.assistantId);
    req.setPaginate(paginate());
    const res = await GetAllAssistantConversation(conn, req);
    const obj = assertOk(res, "GetAllAssistantConversation");
    assert(Array.isArray(obj.data), "data should be an array");
    ctx.conversationId = obj.data[0]?.id;
    if (ctx.conversationId) {
      console.log(
        `    ${C.gray}→ discovered conversationId: ${ctx.conversationId}${C.reset}`
      );
    }
  });

  if (ctx.conversationId) {
    await step("GetAssistantConversation", async (ctx) => {
      const req = new GetAssistantConversationRequest();
      req.setAssistantId(ctx.assistantId);
      req.setId(ctx.conversationId);
      const res = await GetAssistantConversation(conn, req);
      const obj = assertOk(res, "GetAssistantConversation");
      assert(
        obj.data?.id === ctx.conversationId,
        "returned conversation ID mismatch"
      );
    });
  } else {
    skip("GetAssistantConversation", "no conversations found for assistant");
  }

  // ── Webhooks ────────────────────────────────────────────────────────────────
  await step("GetAllAssistantWebhook", async (ctx) => {
    const req = new GetAllAssistantWebhookRequest();
    req.setAssistantId(ctx.assistantId);
    req.setPaginate(paginate());
    const res = await GetAllAssistantWebhook(conn, req);
    const obj = assertOk(res, "GetAllAssistantWebhook");
    assert(Array.isArray(obj.data), "data should be an array");
    ctx.webhookId = obj.data[0]?.id;
    if (ctx.webhookId) {
      console.log(
        `    ${C.gray}→ discovered webhookId: ${ctx.webhookId}${C.reset}`
      );
    }
  });

  if (ctx.webhookId) {
    await step("GetAssistantWebhook", async (ctx) => {
      const req = new GetAssistantWebhookRequest();
      req.setAssistantId(ctx.assistantId);
      req.setId(ctx.webhookId);
      const res = await GetAssistantWebhook(conn, req);
      const obj = assertOk(res, "GetAssistantWebhook");
      assert(obj.data?.id === ctx.webhookId, "returned webhook ID mismatch");
    });
  } else {
    skip("GetAssistantWebhook", "no webhooks configured for assistant");
  }

  // ── Knowledge ───────────────────────────────────────────────────────────────
  await step("GetAllAssistantKnowledge", async (ctx) => {
    const req = new GetAllAssistantKnowledgeRequest();
    req.setAssistantId(ctx.assistantId);
    req.setPaginate(paginate());
    const res = await GetAllAssistantKnowledge(conn, req);
    const obj = assertOk(res, "GetAllAssistantKnowledge");
    assert(Array.isArray(obj.data), "data should be an array");
    ctx.knowledgeId = obj.data[0]?.id;
    if (ctx.knowledgeId) {
      console.log(
        `    ${C.gray}→ discovered knowledgeId: ${ctx.knowledgeId}${C.reset}`
      );
    }
  });

  if (ctx.knowledgeId) {
    await step("GetAssistantKnowledge", async (ctx) => {
      const req = new GetAssistantKnowledgeRequest();
      req.setAssistantId(ctx.assistantId);
      req.setId(ctx.knowledgeId);
      const res = await GetAssistantKnowledge(conn, req);
      assertOk(res, "GetAssistantKnowledge");
    });
  } else {
    skip("GetAssistantKnowledge", "no knowledge bases linked to assistant");
  }

  // ── Tools ───────────────────────────────────────────────────────────────────
  await step("GetAllAssistantTool", async (ctx) => {
    const req = new GetAllAssistantToolRequest();
    req.setAssistantId(ctx.assistantId);
    req.setPaginate(paginate());
    const res = await GetAllAssistantTool(conn, req);
    const obj = assertOk(res, "GetAllAssistantTool");
    assert(Array.isArray(obj.data), "data should be an array");
    ctx.toolId = obj.data[0]?.id;
    if (ctx.toolId) {
      console.log(
        `    ${C.gray}→ discovered toolId: ${ctx.toolId}${C.reset}`
      );
    }
  });

  if (ctx.toolId) {
    await step("GetAssistantTool", async (ctx) => {
      const req = new GetAssistantToolRequest();
      req.setAssistantId(ctx.assistantId);
      req.setId(ctx.toolId);
      const res = await GetAssistantTool(conn, req);
      assertOk(res, "GetAssistantTool");
    });
  } else {
    skip("GetAssistantTool", "no tools configured for assistant");
  }

  // ── Analysis ────────────────────────────────────────────────────────────────
  await step("GetAllAssistantAnalysis", async (ctx) => {
    const req = new GetAllAssistantAnalysisRequest();
    req.setAssistantId(ctx.assistantId);
    req.setPaginate(paginate());
    const res = await GetAllAssistantAnalysis(conn, req);
    const obj = assertOk(res, "GetAllAssistantAnalysis");
    assert(Array.isArray(obj.data), "data should be an array");
    ctx.analysisId = obj.data[0]?.id;
    if (ctx.analysisId) {
      console.log(
        `    ${C.gray}→ discovered analysisId: ${ctx.analysisId}${C.reset}`
      );
    }
  });

  if (ctx.analysisId) {
    await step("GetAssistantAnalysis", async (ctx) => {
      const req = new GetAssistantAnalysisRequest();
      req.setAssistantId(ctx.assistantId);
      req.setId(ctx.analysisId);
      const res = await GetAssistantAnalysis(conn, req);
      assertOk(res, "GetAssistantAnalysis");
    });
  } else {
    skip("GetAssistantAnalysis", "no analyses found for assistant");
  }
}

// ─── Webhook log tests ───────────────────────────────────────────────────────
async function runWebhookLogTests() {
  console.log(`\n${C.bold}${C.cyan}── Webhook Log API ──${C.reset}`);

  await step("GetAllAssistantWebhookLog", async (ctx) => {
    const req = new GetAllAssistantWebhookLogRequest();
    req.setPaginate(paginate());
    const res = await GetAllAssistantWebhookLog(conn, req);
    const obj = assertOk(res, "GetAllAssistantWebhookLog");
    assert(Array.isArray(obj.data), "data should be an array");
    ctx.webhookLogId = obj.data[0]?.id;
    if (ctx.webhookLogId) {
      console.log(
        `    ${C.gray}→ discovered webhookLogId: ${ctx.webhookLogId}${C.reset}`
      );
    }
  });

  if (ctx.webhookLogId) {
    await step("GetAssistantWebhookLog", async (ctx) => {
      const req = new GetAssistantWebhookLogRequest();
      req.setId(ctx.webhookLogId);
      const res = await GetAssistantWebhookLog(conn, req);
      assertOk(res, "GetAssistantWebhookLog");
    });
  } else {
    skip("GetAssistantWebhookLog", "no webhook logs found");
  }
}

// ─── Endpoint tests ──────────────────────────────────────────────────────────
async function runEndpointTests() {
  console.log(`\n${C.bold}${C.cyan}── Endpoint API ──${C.reset}`);

  await step("GetAllEndpoint", async (ctx) => {
    const req = new GetAllEndpointRequest();
    req.setPaginate(paginate());
    const res = await GetAllEndpoint(conn, req);
    const obj = assertOk(res, "GetAllEndpoint");
    assert(Array.isArray(obj.data), "data should be an array");
    ctx.endpointId = obj.data[0]?.id;
    ctx.endpointName = obj.data[0]?.name ?? "(unnamed)";
    if (ctx.endpointId) {
      console.log(
        `    ${C.gray}→ discovered endpointId: ${ctx.endpointId} (${ctx.endpointName})${C.reset}`
      );
    }
  });

  if (!ctx.endpointId) {
    for (const name of ["GetEndpoint", "GetAllEndpointLog", "GetEndpointLog"]) {
      skip(name, "no endpoint found in account");
    }
    const invokeReason =
      process.env.RAPIDA_RUN_INVOKE === "true"
        ? "no endpoint found in account"
        : "set RAPIDA_RUN_INVOKE=true to enable (costs LLM credits)";
    skip("Invoke", invokeReason);
    return;
  }

  await step("GetEndpoint", async (ctx) => {
    const req = new GetEndpointRequest();
    req.setId(ctx.endpointId);
    const res = await GetEndpoint(conn, req);
    const obj = assertOk(res, "GetEndpoint");
    assert(obj.data?.id === ctx.endpointId, "returned endpoint ID mismatch");
  });

  // Invoke is gated — it makes a real LLM call
  if (process.env.RAPIDA_RUN_INVOKE === "true") {
    await step("Invoke", async (ctx) => {
      const endpointDef = new EndpointDefinition();
      endpointDef.setEndpoint(ctx.endpointId);
      endpointDef.setVersion("latest");
      const req = new InvokeRequest();
      req.setEndpoint(endpointDef);
      req.getArgsMap().set("prompt", StringToAny("Hello, this is an automated regression test."));
      const res = await Invoke(conn, req);
      const obj = assertOk(res, "Invoke");
      assert(Array.isArray(obj.data), "invoke response data should be an array");
    });
  } else {
    skip("Invoke", "set RAPIDA_RUN_INVOKE=true to enable (costs LLM credits)");
  }

  await step("GetAllEndpointLog", async (ctx) => {
    const req = new GetAllEndpointLogRequest();
    req.setEndpointId(ctx.endpointId);
    req.setPaginate(paginate());
    const res = await GetAllEndpointLog(conn, req);
    const obj = assertOk(res, "GetAllEndpointLog");
    assert(Array.isArray(obj.data), "data should be an array");
    ctx.endpointLogId = obj.data[0]?.id;
    if (ctx.endpointLogId) {
      console.log(
        `    ${C.gray}→ discovered endpointLogId: ${ctx.endpointLogId}${C.reset}`
      );
    }
  });

  if (ctx.endpointLogId) {
    await step("GetEndpointLog", async (ctx) => {
      const req = new GetEndpointLogRequest();
      req.setEndpointid(ctx.endpointId);
      req.setId(ctx.endpointLogId);
      const res = await GetEndpointLog(conn, req);
      assertOk(res, "GetEndpointLog");
    });
  } else {
    skip("GetEndpointLog", "no endpoint logs found (run Invoke first to generate logs)");
  }
}

// ─── Phone call tests (gated) ────────────────────────────────────────────────
async function runCallTests() {
  console.log(`\n${C.bold}${C.cyan}── Phone Call API ──${C.reset}`);

  if (process.env.RAPIDA_RUN_CALLS !== "true") {
    skip("CreatePhoneCall", "set RAPIDA_RUN_CALLS=true and RAPIDA_TO_NUMBER=+XX… to enable");
    return;
  }
  const toNumber = process.env.RAPIDA_TO_NUMBER;
  if (!toNumber) {
    skip("CreatePhoneCall", "RAPIDA_TO_NUMBER env var is required when RAPIDA_RUN_CALLS=true");
    return;
  }
  if (!ctx.assistantId) {
    skip("CreatePhoneCall", "no assistant ID discovered — cannot place call");
    return;
  }

  await step("CreatePhoneCall", async (ctx) => {
    const asst = new AssistantDefinition();
    asst.setAssistantid(ctx.assistantId);
    const req = new CreatePhoneCallRequest();
    req.setAssistant(asst);
    req.setTonumber(toNumber);
    const res = await CreatePhoneCall(conn, req);
    const obj = assertOk(res, "CreatePhoneCall");
    assert(obj.data?.id, "expected conversation ID in phone call response");
    console.log(
      `    ${C.gray}→ call conversation ID: ${obj.data.id}${C.reset}`
    );
  });
}

// ─── Summary ─────────────────────────────────────────────────────────────────
function printSummary() {
  const passed = results.filter((r) => r.status === "pass").length;
  const failed = results.filter((r) => r.status === "fail").length;
  const skipped = results.filter((r) => r.status === "skip").length;
  const totalMs = results.reduce((s, r) => s + (r.ms || 0), 0);

  const nameWidth = Math.max(...results.map((r) => r.name.length), 20) + 2;
  const divider = "─".repeat(nameWidth + 16);

  console.log(`\n${C.bold}Results${C.reset}`);
  console.log(divider);
  for (const r of results) {
    const icon =
      r.status === "pass"
        ? `${C.green}PASS${C.reset}`
        : r.status === "fail"
        ? `${C.red}FAIL${C.reset}`
        : `${C.yellow}SKIP${C.reset}`;
    const time =
      r.ms != null ? ` ${C.gray}${String(r.ms).padStart(5)}ms${C.reset}` : "";
    console.log(`  ${r.name.padEnd(nameWidth)} ${icon}${time}`);
    if (r.status === "fail") {
      console.log(`    ${C.red}↳ ${r.error}${C.reset}`);
    }
    if (r.status === "skip") {
      console.log(`    ${C.yellow}↳ ${r.reason}${C.reset}`);
    }
  }
  console.log(divider);
  console.log(
    `\n  ${C.green}${C.bold}${passed} passed${C.reset}` +
      `  ${C.red}${failed} failed${C.reset}` +
      `  ${C.yellow}${skipped} skipped${C.reset}` +
      `  ${C.gray}${totalMs}ms total${C.reset}\n`
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${C.bold}Rapida API Regression Test Suite${C.reset}`);
  console.log(
    `${C.gray}Key: ${apiKey.slice(0, 8)}…  Timestamp: ${new Date().toISOString()}${C.reset}`
  );

  await runAssistantTests();
  await runWebhookLogTests();
  await runEndpointTests();
  await runCallTests();

  printSummary();

  const failed = results.filter((r) => r.status === "fail").length;
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`\n${C.red}Fatal: ${err.message}${C.reset}`);
  process.exit(1);
});
