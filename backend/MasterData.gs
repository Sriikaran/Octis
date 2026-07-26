// ==========================================
// 1. Get Operations
// ==========================================
function getWorkers() {
  const data = getSheetDataAsObjects("Workers");
  return successResponse("Workers fetched", data);
}

function getItems() {
  const data = getSheetDataAsObjects("Items");
  return successResponse("Items fetched", data);
}

function getPurities() {
  const data = getSheetDataAsObjects("Purities");
  return successResponse("Purities fetched", data);
}

// ==========================================
// 2. Add If Missing Operations
// ==========================================
function addWorkerIfMissing(workerName) {
  if (!workerName || String(workerName).trim() === "") return;
  const name = String(workerName).trim();
  
  const sheet = getSheet("Workers");
  const lastRow = sheet.getLastRow();
  
  let exists = false;
  if (lastRow > 1) {
    // Assuming schema: id | worker | createdAt (worker name is in column 2)
    const names = sheet.getRange(2, 2, lastRow - 1, 1).getValues().flat();
    if (names.includes(name)) {
      exists = true;
    }
  }

  if (!exists) {
    const id = generateUUID();
    const createdAt = currentTimestamp();
    sheet.appendRow([id, name, createdAt]);
  }
}

function addItemIfMissing(itemName) {
  if (!itemName || String(itemName).trim() === "") return;
  const name = String(itemName).trim();
  
  const sheet = getSheet("Items");
  const lastRow = sheet.getLastRow();
  
  let exists = false;
  if (lastRow > 1) {
    // Assuming schema: id | item | createdAt (item name is in column 2)
    const names = sheet.getRange(2, 2, lastRow - 1, 1).getValues().flat();
    if (names.includes(name)) {
      exists = true;
    }
  }

  if (!exists) {
    const id = generateUUID();
    const createdAt = currentTimestamp();
    sheet.appendRow([id, name, createdAt]);
  }
}

function addPurityIfMissing(purityValue) {
  if (purityValue === undefined || purityValue === null || String(purityValue).trim() === "") return;
  const purity = parseNumeric(purityValue, null);
  if (purity === null) return;
  
  const sheet = getSheet("Purities");
  const lastRow = sheet.getLastRow();
  
  let exists = false;
  if (lastRow > 1) {
    // Assuming schema: id | purity | createdAt (purity is in column 2)
    const purities = sheet.getRange(2, 2, lastRow - 1, 1).getValues().flat();
    if (purities.includes(purity) || purities.includes(String(purity))) {
      exists = true;
    }
  }

  if (!exists) {
    const id = generateUUID();
    const createdAt = currentTimestamp();
    sheet.appendRow([id, purity, createdAt]);
  }
}
