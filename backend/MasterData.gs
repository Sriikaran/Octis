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
// 2. Reference Checking Engines
// ==========================================
function getWorkerReferenceCount(workerName) {
  if (!workerName) return { totalCount: 0, details: {} };
  const target = String(workerName).trim().toLowerCase();

  let gdCount = 0;
  let jcCount = 0;

  // Search GoldDistribution
  const gdSheet = ss.getSheetByName("GoldDistribution");
  if (gdSheet && gdSheet.getLastRow() > 1) {
    const data = gdSheet.getRange(2, 3, gdSheet.getLastRow() - 1, 1).getValues().flat(); // Col 3 = WorkerName
    gdCount = data.filter(w => String(w).trim().toLowerCase() === target).length;
  }

  // Search JewelleryCollection
  const jcSheet = ss.getSheetByName("JewelleryCollection");
  if (jcSheet && jcSheet.getLastRow() > 1) {
    const data = jcSheet.getRange(2, 3, jcSheet.getLastRow() - 1, 1).getValues().flat(); // Col 3 = WorkerName
    jcCount = data.filter(w => String(w).trim().toLowerCase() === target).length;
  }

  const details = {};
  if (gdCount > 0) details["Gold Distribution"] = gdCount;
  if (jcCount > 0) details["Jewellery Collection"] = jcCount;

  return {
    totalCount: gdCount + jcCount,
    details: details
  };
}

function getItemReferenceCount(itemName) {
  if (!itemName) return { totalCount: 0, details: {} };
  const target = String(itemName).trim().toLowerCase();

  let jcCount = 0;
  const jcSheet = ss.getSheetByName("JewelleryCollection");
  if (jcSheet && jcSheet.getLastRow() > 1) {
    const data = jcSheet.getRange(2, 4, jcSheet.getLastRow() - 1, 1).getValues().flat(); // Col 4 = Item
    jcCount = data.filter(i => String(i).trim().toLowerCase() === target).length;
  }

  const details = {};
  if (jcCount > 0) details["Jewellery Collection"] = jcCount;

  return {
    totalCount: jcCount,
    details: details
  };
}

function getPurityReferenceCount(purityVal) {
  if (purityVal === undefined || purityVal === null) return { totalCount: 0, details: {} };
  const target = parseNumeric(purityVal, null);
  if (target === null) return { totalCount: 0, details: {} };

  let gdCount = 0;
  let jcCount = 0;

  // Search GoldDistribution (Col 6 = Purity)
  const gdSheet = ss.getSheetByName("GoldDistribution");
  if (gdSheet && gdSheet.getLastRow() > 1) {
    const data = gdSheet.getRange(2, 6, gdSheet.getLastRow() - 1, 1).getValues().flat();
    gdCount = data.filter(p => parseNumeric(p, null) === target).length;
  }

  // Search JewelleryCollection (Col 10 = Purity)
  const jcSheet = ss.getSheetByName("JewelleryCollection");
  if (jcSheet && jcSheet.getLastRow() > 1) {
    const data = jcSheet.getRange(2, 10, jcSheet.getLastRow() - 1, 1).getValues().flat();
    jcCount = data.filter(p => parseNumeric(p, null) === target).length;
  }

  const details = {};
  if (gdCount > 0) details["Gold Distribution"] = gdCount;
  if (jcCount > 0) details["Jewellery Collection"] = jcCount;

  return {
    totalCount: gdCount + jcCount,
    details: details
  };
}

// ==========================================
// 3. Create Operations (with duplicate check)
// ==========================================
function createWorker(data) {
  requireFields(data, ["name"]);
  const name = String(data.name).trim();

  const sheet = getSheet("Workers");
  const lastRow = sheet.getLastRow();

  if (lastRow > 1 && sheet.getLastColumn() > 0) {
    const existing = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
    for (let row of existing) {
      if (row.some(cell => String(cell).trim().toLowerCase() === name.toLowerCase())) {
        return errorResponse("Worker already exists: " + name);
      }
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

  const sheet = getSheet("Items");
  const lastRow = sheet.getLastRow();

  if (lastRow > 1 && sheet.getLastColumn() > 0) {
    const existing = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
    for (let row of existing) {
      if (row.some(cell => String(cell).trim().toLowerCase() === name.toLowerCase())) {
        return errorResponse("Item already exists: " + name);
      }
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

  const sheet = getSheet("Purities");
  const lastRow = sheet.getLastRow();

  if (lastRow > 1 && sheet.getLastColumn() > 0) {
    const existing = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues().flat();
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

  const refCheck = getWorkerReferenceCount(name);
  if (refCheck.totalCount > 0) {
    const breakdown = Object.entries(refCheck.details).map(([k, v]) => `• ${k} (${v})`).join(" ");
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      referenced: true,
      totalCount: refCheck.totalCount,
      details: refCheck.details,
      message: `Cannot delete Worker "${name}". Used in ${breakdown}`
    })).setMimeType(ContentService.MimeType.JSON);
  }

  const sheet = getSheet("Workers");
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return errorResponse("Worker not found");

  const values = sheet.getRange(2, 1, lastRow - 1, Math.max(2, sheet.getLastColumn())).getValues();
  let targetRow = -1;

  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    if (row.some(cell => String(cell).trim().toLowerCase() === name.toLowerCase())) {
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

  const refCheck = getItemReferenceCount(name);
  if (refCheck.totalCount > 0) {
    const breakdown = Object.entries(refCheck.details).map(([k, v]) => `• ${k} (${v})`).join(" ");
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      referenced: true,
      totalCount: refCheck.totalCount,
      details: refCheck.details,
      message: `Cannot delete Item "${name}". Used in ${breakdown}`
    })).setMimeType(ContentService.MimeType.JSON);
  }

  const sheet = getSheet("Items");
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return errorResponse("Item not found");

  const values = sheet.getRange(2, 1, lastRow - 1, Math.max(2, sheet.getLastColumn())).getValues();
  let targetRow = -1;

  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    if (row.some(cell => String(cell).trim().toLowerCase() === name.toLowerCase())) {
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

  const refCheck = getPurityReferenceCount(purity);
  if (refCheck.totalCount > 0) {
    const breakdown = Object.entries(refCheck.details).map(([k, v]) => `• ${k} (${v})`).join(" ");
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      referenced: true,
      totalCount: refCheck.totalCount,
      details: refCheck.details,
      message: `Cannot delete Purity "${purity}%". Used in ${breakdown}`
    })).setMimeType(ContentService.MimeType.JSON);
  }

  const sheet = getSheet("Purities");
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return errorResponse("Purity not found");

  const values = sheet.getRange(2, 1, lastRow - 1, Math.max(2, sheet.getLastColumn())).getValues();
  let targetRow = -1;

  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    if (row.some(cell => parseNumeric(cell, null) === purity)) {
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
