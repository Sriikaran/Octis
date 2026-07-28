// ==========================================
// 0. Setup and Helpers
// ==========================================
function ensureMasterDataHeaders(sheetName, headers) {
  const sheet = getSheet(sheetName);
  const lastRow = sheet.getLastRow();
  if (lastRow === 0) {
    sheet.appendRow(headers);
  } else {
    // Overwrite the first row only if they don't match the required headers.
    const currentHeaders = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    if (currentHeaders.join(",") !== headers.join(",")) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }
  return sheet;
}

// ==========================================
// 1. Get Operations
// ==========================================
function getWorkers() {
  ensureMasterDataHeaders("Workers", ["ID", "WorkerName", "CreatedAt"]);
  const data = getSheetDataAsObjects("Workers");
  return successResponse("Workers fetched", data);
}

function getItems() {
  ensureMasterDataHeaders("Items", ["ID", "Item", "CreatedAt"]);
  const data = getSheetDataAsObjects("Items");
  return successResponse("Items fetched", data);
}

function getPurities() {
  ensureMasterDataHeaders("Purities", ["ID", "Purity", "CreatedAt"]);
  const data = getSheetDataAsObjects("Purities");
  return successResponse("Purities fetched", data);
}

// ==========================================
// 2. Reference Checking Engines (Removed as per user request)
// ==========================================

// ==========================================
// 3. Create Operations (with duplicate check)
// ==========================================
function createWorker(data) {
  requireFields(data, ["name"]);
  const name = String(data.name).trim();

  const sheet = ensureMasterDataHeaders("Workers", ["ID", "WorkerName", "CreatedAt"]);
  const lastRow = sheet.getLastRow();

  if (lastRow > 1) {
    // Only fetch Col 2 (WorkerName) to improve performance
    const existing = sheet.getRange(2, 2, lastRow - 1, 1).getValues().flat();
    if (existing.some(val => String(val).trim().toLowerCase() === name.toLowerCase())) {
      return errorResponse("Worker already exists: " + name);
    }
  }

  const id = generateUUID();
  const createdAt = currentTimestamp();
  sheet.appendRow([id, name, createdAt]);

  return successResponse("Worker created successfully", { id: id, name: name, createdAt: createdAt });
}

function createItem(data) {
  requireFields(data, ["name"]);
  const name = String(data.name).trim();

  const sheet = ensureMasterDataHeaders("Items", ["ID", "Item", "CreatedAt"]);
  const lastRow = sheet.getLastRow();

  if (lastRow > 1) {
    // Only fetch Col 2 (Item) to improve performance
    const existing = sheet.getRange(2, 2, lastRow - 1, 1).getValues().flat();
    if (existing.some(val => String(val).trim().toLowerCase() === name.toLowerCase())) {
      return errorResponse("Item already exists: " + name);
    }
  }

  const id = generateUUID();
  const createdAt = currentTimestamp();
  sheet.appendRow([id, name, createdAt]);

  return successResponse("Item created successfully", { id: id, name: name, createdAt: createdAt });
}

function createPurity(data) {
  requireFields(data, ["purity"]);
  const purity = parseNumeric(data.purity, null);
  if (purity === null) return errorResponse("Invalid purity value");

  const sheet = ensureMasterDataHeaders("Purities", ["ID", "Purity", "CreatedAt"]);
  const lastRow = sheet.getLastRow();

  if (lastRow > 1) {
    // Only fetch Col 2 (Purity) to improve performance
    const existing = sheet.getRange(2, 2, lastRow - 1, 1).getValues().flat();
    if (existing.some(val => parseNumeric(val, null) === purity)) {
      return errorResponse("Purity already exists: " + purity);
    }
  }

  const id = generateUUID();
  const createdAt = currentTimestamp();
  sheet.appendRow([id, purity, createdAt]);

  return successResponse("Purity created successfully", { id: id, purity: purity, createdAt: createdAt });
}

// ==========================================
// 4. Delete Operations (with reference checks)
// ==========================================
function deleteWorker(data) {
  requireFields(data, ["name"]);
  const name = String(data.name).trim();

  const sheet = ensureMasterDataHeaders("Workers", ["ID", "WorkerName", "CreatedAt"]);
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return errorResponse("Worker not found");

  const values = sheet.getRange(2, 2, lastRow - 1, 1).getValues().flat();
  let targetRow = -1;

  for (let i = 0; i < values.length; i++) {
    if (String(values[i]).trim().toLowerCase() === name.toLowerCase()) {
      targetRow = i + 2;
      break;
    }
  }

  if (targetRow === -1) return errorResponse("Worker not found: " + name);

  sheet.deleteRow(targetRow);
  return successResponse(`Worker "${name}" deleted successfully.`);
}

function deleteItem(data) {
  requireFields(data, ["name"]);
  const name = String(data.name).trim();

  const sheet = ensureMasterDataHeaders("Items", ["ID", "Item", "CreatedAt"]);
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return errorResponse("Item not found");

  const values = sheet.getRange(2, 2, lastRow - 1, 1).getValues().flat();
  let targetRow = -1;

  for (let i = 0; i < values.length; i++) {
    if (String(values[i]).trim().toLowerCase() === name.toLowerCase()) {
      targetRow = i + 2;
      break;
    }
  }

  if (targetRow === -1) return errorResponse("Item not found: " + name);

  sheet.deleteRow(targetRow);
  return successResponse(`Item "${name}" deleted successfully.`);
}

function deletePurity(data) {
  requireFields(data, ["purity"]);
  const purity = parseNumeric(data.purity, null);
  if (purity === null) return errorResponse("Invalid purity value");

  const sheet = ensureMasterDataHeaders("Purities", ["ID", "Purity", "CreatedAt"]);
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return errorResponse("Purity not found");

  const values = sheet.getRange(2, 2, lastRow - 1, 1).getValues().flat();
  let targetRow = -1;

  for (let i = 0; i < values.length; i++) {
    if (parseNumeric(values[i], null) === purity) {
      targetRow = i + 2;
      break;
    }
  }

  if (targetRow === -1) return errorResponse("Purity not found: " + purity);

  sheet.deleteRow(targetRow);
  return successResponse(`Purity "${purity}%" deleted successfully.`);
}

// ==========================================
// 5. Add If Missing Helpers (Auto Creation)
// ==========================================
function addWorkerIfMissing(workerName) {
  if (!workerName || String(workerName).trim() === "") return;
  createWorker({ name: workerName });
}

function addItemIfMissing(itemName) {
  if (!itemName || String(itemName).trim() === "") return;
  createItem({ name: itemName });
}

function addPurityIfMissing(purityValue) {
  if (purityValue === undefined || purityValue === null || String(purityValue).trim() === "") return;
  createPurity({ purity: purityValue });
}
