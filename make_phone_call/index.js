import {
  AssistantDefinition,
  CreatePhoneCall,
  ConnectionConfig,
  CreatePhoneCallRequest,
} from "@rapidaai/nodejs";

let connectionCfg = ConnectionConfig.DefaultConnectionConfig(
  ConnectionConfig.WithSDK({
    ApiKey: "YOUR_API_KEY_PLACEHOLDER",
  })
);
const phoneCallRequest = new CreatePhoneCallRequest();
// define assistant
const assistant = new AssistantDefinition();
assistant.setAssistantid("ASSISTANT_ID_PLACEHOLDER");
assistant.setVersion("VERSION_PLACEHOLDER");
phoneCallRequest.setAssistant(assistant);
phoneCallRequest.setTonumber("TO_NUMBER_PLACEHOLDER");

CreatePhoneCall(connectionCfg, phoneCallRequest)
  .then((x) => {
    if (x.getSuccess()) {
      console.dir(x.getData().toObject());
      return;
    }
    let err = x.getError();
    if (err?.getHumanmessage()) setError(err?.getHumanmessage());
  })
  .catch((x) => {
    console.dir(x);
  });
