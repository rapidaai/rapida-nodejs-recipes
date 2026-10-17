import {
  AssistantDefinition,
  CreatePhoneCall,
  ConnectionConfig,
  CreatePhoneCallRequest,
} from "@rapidaai/nodejs";

let connectionCfg = ConnectionConfig.DefaultConnectionConfig(
  ConnectionConfig.WithSDK({
    ApiKey: "1fee767205d6fc1926dd3e4d072ba7d51b6e7aa71d592185f1dbe1b63752421c",
  })
);
const phoneCallRequest = new CreatePhoneCallRequest();
// define assistant
const assistant = new AssistantDefinition();
assistant.setAssistantid("2344766176627785728");
// assistant.setVersion("VERSION_PLACEHOLDER");
phoneCallRequest.setAssistant(assistant);
phoneCallRequest.setTonumber("9110823449");

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
