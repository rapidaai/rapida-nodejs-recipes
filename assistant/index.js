import {
  ConnectionConfig,
  Paginate,
  GetAssistantRequest,
  GetAllAssistantRequest,
  GetAssistantConversationRequest,
  GetAllAssistantConversationRequest,
  GetAssistantWebhookRequest,
  GetAllAssistantWebhookRequest,
  GetAssistantKnowledgeRequest,
  GetAllAssistantKnowledgeRequest,
  GetAssistantToolRequest,
  GetAllAssistantToolRequest,
  GetAssistantAnalysisRequest,
  GetAllAssistantAnalysisRequest,
  GetAssistantWebhookLogRequest,
  GetAllAssistantWebhookLogRequest,
} from "@rapidaai/nodejs";

const connectionConfig = ConnectionConfig.DefaultConnectionConfig(
  ConnectionConfig.WithSDK({
    ApiKey: process.env.RAPIDA_PROJECT_CREDENTIAL,
  })
);

async function getAssistant(assistantId, providerModelId) {
  const request = new GetAssistantRequest();
  request.setId(assistantId);
  if (providerModelId) {
    request.setAssistantProviderModelId(providerModelId);
  }

  try {
    const response = await connectionConfig.assistantClient.getAssistant(
      request
    );
    console.log("Assistant Response:", response.toObject());
  } catch (error) {
    console.error("Error with GetAssistant call:", error);
  }
}

async function getAllAssistant(page = 0, pageSize = 20) {
  const pagination = new Paginate();
  pagination.setPage(page);
  pagination.setPageSize(pageSize);

  const request = new GetAllAssistantRequest();
  request.setPaginate(pagination);

  try {
    const response = await connectionConfig.assistantClient.getAllAssistant(
      request
    );
    console.log("All Assistants Response:", response.toObject());
  } catch (error) {
    console.error("Error with GetAllAssistant call:", error);
  }
}

async function getAssistantConversation(assistantId, conversationId, fields) {
  const request = new GetAssistantConversationRequest();
  request.setAssistantId(assistantId);
  request.setAssistantConversationId(conversationId);
  request.setSelectors(fields);

  try {
    const response =
      await connectionConfig.assistantClient.getAssistantConversation(request);
    console.log("Assistant Conversation Response:", response.toObject());
  } catch (error) {
    console.error("Error with GetAssistantConversation call:", error);
  }
}

async function getAllAssistantConversation(
  assistantId,
  page = 0,
  pageSize = 20
) {
  const pagination = new Paginate();
  pagination.setPage(page);
  pagination.setPageSize(pageSize);

  const request = new GetAllAssistantConversationRequest();
  request.setAssistantId(assistantId);
  request.setPaginate(pagination);

  try {
    const response =
      await connectionConfig.assistantClient.getAllAssistantConversation(
        request
      );
    console.log("All Assistant Conversations Response:", response.toObject());
  } catch (error) {
    console.error("Error with GetAllAssistantConversation call:", error);
  }
}

async function getAssistantWebhook(assistantId, webhookId) {
  const request = new GetAssistantWebhookRequest();
  request.setAssistantId(assistantId);
  request.setId(webhookId);

  try {
    const response = await connectionConfig.assistantClient.getAssistantWebhook(
      request
    );
    console.log("Assistant Webhook Response:", response.toObject());
  } catch (error) {
    console.error("Error with GetAssistantWebhook call:", error);
  }
}

async function getAllAssistantWebhook(assistantId, page = 0, pageSize = 20) {
  const pagination = new Paginate();
  pagination.setPage(page);
  pagination.setPageSize(pageSize);

  const request = new GetAllAssistantWebhookRequest();
  request.setAssistantId(assistantId);
  request.setPaginate(pagination);

  try {
    const response =
      await connectionConfig.assistantClient.getAllAssistantWebhook(request);
    console.log("All Assistant Webhooks Response:", response.toObject());
  } catch (error) {
    console.error("Error with GetAllAssistantWebhook call:", error);
  }
}

async function getAssistantKnowledge(assistantId, knowledgeId) {
  const request = new GetAssistantKnowledgeRequest();
  request.setAssistantId(assistantId);
  request.setId(knowledgeId);

  try {
    const response =
      await connectionConfig.assistantClient.getAssistantKnowledge(request);
    console.log("Assistant Knowledge Response:", response.toObject());
  } catch (error) {
    console.error("Error with GetAssistantKnowledge call:", error);
  }
}

async function getAllAssistantKnowledge(assistantId, page = 0, pageSize = 20) {
  const pagination = new Paginate();
  pagination.setPage(page);
  pagination.setPageSize(pageSize);

  const request = new GetAllAssistantKnowledgeRequest();
  request.setAssistantId(assistantId);
  request.setPaginate(pagination);

  try {
    const response =
      await connectionConfig.assistantClient.getAllAssistantKnowledge(request);
    console.log("All Assistant Knowledge Response:", response.toObject());
  } catch (error) {
    console.error("Error with GetAllAssistantKnowledge call:", error);
  }
}

async function getAssistantTool(assistantId, toolId) {
  const request = new GetAssistantToolRequest();
  request.setAssistantId(assistantId);
  request.setId(toolId);

  try {
    const response = await connectionConfig.assistantClient.getAssistantTool(
      request
    );
    console.log("Assistant Tool Response:", response.toObject());
  } catch (error) {
    console.error("Error with GetAssistantTool call:", error);
  }
}

async function getAllAssistantTool(assistantId, page = 0, pageSize = 20) {
  const pagination = new Paginate();
  pagination.setPage(page);
  pagination.setPageSize(pageSize);

  const request = new GetAllAssistantToolRequest();
  request.setAssistantId(assistantId);
  request.setPaginate(pagination);

  try {
    const response = await connectionConfig.assistantClient.getAllAssistantTool(
      request
    );
    console.log("All Assistant Tools Response:", response.toObject());
  } catch (error) {
    console.error("Error with GetAllAssistantTool call:", error);
  }
}

async function getAssistantAnalysis(assistantId, analysisId) {
  const request = new GetAssistantAnalysisRequest();
  request.setAssistantId(assistantId);
  request.setId(analysisId);

  try {
    const response =
      await connectionConfig.assistantClient.getAssistantAnalysis(request);
    console.log("Assistant Analysis Response:", response.toObject());
  } catch (error) {
    console.error("Error with GetAssistantAnalysis call:", error);
  }
}

async function getAllAssistantAnalysis(assistantId, page = 0, pageSize = 20) {
  const pagination = new Paginate();
  pagination.setPage(page);
  pagination.setPageSize(pageSize);

  const request = new GetAllAssistantAnalysisRequest();
  request.setAssistantId(assistantId);
  request.setPaginate(pagination);

  try {
    const response =
      await connectionConfig.assistantClient.getAllAssistantAnalysis(request);
    console.log("All Assistant Analyses Response:", response.toObject());
  } catch (error) {
    console.error("Error with GetAllAssistantAnalysis call:", error);
  }
}

async function getAssistantWebhookLog(webhookLogId) {
  const request = new GetAssistantWebhookLogRequest();
  request.setId(webhookLogId);

  try {
    const response =
      await connectionConfig.assistantClient.getAssistantWebhookLog(request);
    console.log("Assistant Webhook Log Response:", response.toObject());
  } catch (error) {
    console.error("Error with GetAssistantWebhookLog call:", error);
  }
}

async function getAllAssistantWebhookLog(page = 0, pageSize = 20) {
  const pagination = new Paginate();
  pagination.setPage(page);
  pagination.setPageSize(pageSize);

  const request = new GetAllAssistantWebhookLogRequest();
  request.setPaginate(pagination);

  try {
    const response =
      await connectionConfig.assistantClient.getAllAssistantWebhookLog(request);
    console.log("All Assistant Webhook Logs Response:", response.toObject());
  } catch (error) {
    console.error("Error with GetAllAssistantWebhookLog call:", error);
  }
}

// Example usage of all functions
// Uncomment for specific calls
getAssistant("45678903456789", "3476544567890987654");
getAllAssistant();
getAssistantConversation("3456789876541212", "567898765456788765", [
  { field: "metadata" },
]);
getAllAssistantConversation("3456789876541212");
getAssistantWebhook("3456789876541212", "567898765456788765");
getAllAssistantWebhook("3456789876541212");
getAssistantKnowledge("3456789876541212", "567898765456788765");
getAllAssistantKnowledge("3456789876541212");
getAssistantTool("3456789876541212", "567898765456788765");
getAllAssistantTool("3456789876541212");
getAssistantAnalysis("3456789876541212", "567898765456788765");
getAllAssistantAnalysis("3456789876541212");
getAssistantWebhookLog("567898765456788765");
getAllAssistantWebhookLog();
