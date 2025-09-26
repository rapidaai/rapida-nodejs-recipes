import {
  Invoke,
  ConnectionConfig,
  GetEndpoint,
  InvokeRequest,
  EndpointDefinition,
  StringToAny,
  GetEndpointRequest,
  GetAllEndpointRequest,
  Paginate,
  Criteria,
  GetEndpointLogRequest,
  GetAllEndpointLogRequest,
} from "@rapidaai/nodejs";
// ... existing imports ...

/**
 * Invoke endpoint with provided arguments, metadata, and options.
 */
async function invokeEndpoint(connectionCfg) {
  const request = new InvokeRequest();
  let endpointDef = new EndpointDefinition();
  endpointDef.setEndpoint(2223006263292198912);
  endpointDef.setVersion("latest");
  request.setEndpoint(endpointDef);
  request.getArgsMap().set("can", StringToAny("Prompt_ARGUMENT"));
  request.getArgsMap().set("can", StringToAny("Prompt_ARGUMENT_2"));

  // metadata
  request.getMetadataMap().set("track", StringToAny("metadata_to_track"));

  // options
  request.getOptionsMap().set("model_options", StringToAny("x"));
  const response = await Invoke(connectionCfg, request);
  if (response.getError()) {
    console.error(
      "Error invoking endpoint:",
      response.getError()?.getHumanmessage()
    );
  } else {
    console.log("Endpoint invoked successfully:", response.getData());
  }
}

/**
 * Get details of a specific endpoint.
 */
async function getEndpoint(connectionCfg) {
  const request = new GetEndpointRequest();
  // endpointId
  request.setId(2223006263292198912);

  const response = await GetEndpoint(connectionCfg, request);
  if (response.getError()) {
    console.error(
      "Error fetching endpoint details:",
      response.getError()?.getHumanmessage()
    );
  } else {
    console.log("Endpoint Details:", response.getData());
  }
}

/**
 * Get all endpoints with pagination.
 */
async function getAllEndpoints(connectionCfg) {
  const request = new GetAllEndpointRequest();

  let paginate = new Paginate();
  paginate.setPage(0);
  paginate.setPagesize(20);
  request.setPaginate(paginate);

  let criteria = new Criteria();
  criteria.setKey("KEY FOR FILTER");
  criteria.setValue("MATCHING _VAULE");
  criteria.setLogic("should" || "must");
  request.addCriterias(criteria);
  const response = await GetAllEndpoints(connectionCfg, request);
  if (response.getError()) {
    console.error(
      "Error fetching all endpoints:",
      response.getError()?.getHumanmessage()
    );
  } else {
    console.log("All Endpoints:", response.getData().toObject());
  }
}

/**
 * Get logs of a specific endpoint.
 */
async function getEndpointLog(connectionCfg) {
  const request = new GetEndpointLogRequest();
  request.setId(2223006263292198912);
  request.setEndpointid(2223006263292198912);
  const response = await GetEndpointLog(connectionCfg, request);

  if (response.getError()) {
    console.error(
      "Error fetching endpoint log:",
      response.getError()?.getHumanmessage()
    );
  } else {
    console.log("Endpoint Log Details:", response.getData());
  }
}

/**
 * Get all logs of a specific endpoint with pagination.
 */
async function getAllEndpointLogs(connectionCfg) {
  const request = new GetAllEndpointLogRequest();

  let paginate = new Paginate();
  paginate.setPage(0);
  paginate.setPagesize(20);
  request.setPaginate(paginate);

  let criteria = new Criteria();
  criteria.setKey("KEY FOR FILTER");
  criteria.setValue("MATCHING _VAULE");
  criteria.setLogic("should" || "must");
  request.addCriterias(criteria);
  const response = await GetAllEndpointLog(connectionCfg, request);

  if (response.getError()) {
    console.error(
      "Error fetching all endpoint logs:",
      response.getError()?.getHumanmessage()
    );
  } else {
    console.log("All Endpoint Logs:", response.getData().toObject());
  }
}

// Example usage
(async () => {
  const connectionCfg = ConnectionConfig.DefaultConnectionConfig(
    ConnectionConfig.WithSDK({
      ApiKey: process.env.RAPIDA_PROJECT_CREDENTIAL,
    })
  );

  await invokeEndpoint(connectionCfg);
  await getEndpoint(connectionCfg);
  await getAllEndpoints(connectionCfg);
  await getEndpointLog(connectionCfg);
  await getAllEndpointLogs(connectionCfg);
})();
