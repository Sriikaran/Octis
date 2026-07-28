function doGet(e) {
  try {
    const action = e.parameter.action;

    switch(action || "") {
      case "getDistribution":
        return getDistribution();
      case "getCollection":
        return getCollection();
      case "getWorkers":
        return getWorkers();
      case "getItems":
        return getItems();
      case "getPurities":
        return getPurities();
      case "getAllGold":
        return getAllGold();
      case "getAllCollection":
        return getAllCollection();
      case "getVersion":
        return successResponse("Version Info", {
          version: "1.0.0",
          backend: "Apps Script",
          status: "healthy"
        });
      case "healthCheck":
        return successResponse("Health Check", {
          spreadsheet: "connected",
          timestamp: currentTimestamp()
        });
      default:
        return successResponse("Jewellery Tracking API Running", null);
    }
  } catch (error) {
    return errorResponse("An error occurred processing GET request", error);
  }
}

function doPost(e) {
  try {
    if (!e.postData || !e.postData.contents) {
       return errorResponse("Invalid Payload", "No JSON payload provided.");
    }
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    switch(action) {
      case "createDistribution":
        return createDistribution(data);
      case "updateDistribution":
        return updateDistribution(data);
      case "deleteDistribution":
        return deleteDistribution(data);
        
      case "createCollection":
        return createCollection(data);
      case "updateCollection":
        return updateCollection(data);
      case "deleteCollection":
        return deleteCollection(data);

      case "createWorker":
        return createWorker(data);
      case "deleteWorker":
        return deleteWorker(data);

      case "createItem":
        return createItem(data);
      case "deleteItem":
        return deleteItem(data);

      case "createPurity":
        return createPurity(data);
      case "deletePurity":
        return deletePurity(data);

      default:
        return errorResponse("Invalid Action", "The requested action does not exist.");
    }
  } catch (error) {
    return errorResponse("An error occurred processing POST request", error);
  }
}