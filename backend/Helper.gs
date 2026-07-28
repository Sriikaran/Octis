const ss = SpreadsheetApp.getActiveSpreadsheet();

// ==========================================
// 1. JSON Responses
// ==========================================
function successResponse(message, data = null) {
  const response = {
    success: true,
    message: message
  };
  if (data !== null) response.data = data;
  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(message, error = null) {
  const response = {
    success: false,
    message: message
  };
  if (error !== null) {
    response.error = error instanceof Error ? error.message : String(error);
  }
  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// 2. ID Generation
// ==========================================
function generateUUID() {
  return Utilities.getUuid();
}

function generateRecordId(sheetName, prefix, recordIdColIndex = 1) {
  const sheet = getSheet(sheetName);
  const lastRow = sheet.getLastRow();
  
  if (lastRow <= 1) {
    return prefix + "000001";
  }

  const recordIds = sheet.getRange(2, recordIdColIndex, lastRow - 1, 1).getValues().flat();
  let maxNumber = 0;
  
  for (let id of recordIds) {
    const strId = String(id);
    if (strId.startsWith(prefix)) {
      const num = parseInt(strId.replace(prefix, ""), 10) || 0;
      if (num > maxNumber) maxNumber = num;
    }
  }

  return prefix + Utilities.formatString("%06d", maxNumber + 1);
}

// ==========================================
// 3. Timestamps
// ==========================================
function currentTimestamp() {
  return new Date().toISOString();
}

// ==========================================
// 4. Batch Operations & Core Utilities
// ==========================================
function getSheet(sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error("Sheet not found: " + sheetName);
  return sheet;
}

function getSheetDataAsObjects(sheetName) {
  const sheet = getSheet(sheetName);
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();
  
  if (lastRow <= 1) return [];
  
  const data = sheet.getRange(1, 1, lastRow, lastColumn).getValues();
  const headers = data.shift();
  
  return data.map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      let val = row[index];
      if (val instanceof Date) {
        val = val.toISOString();
      }
      obj[header] = val;
    });
    return obj;
  });
}

function findRowByInternalId(sheetName, id, idColIndex = 1) {
  const sheet = getSheet(sheetName);
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return -1;

  const ids = sheet.getRange(2, idColIndex, lastRow - 1, 1).getValues().flat();
  const index = ids.indexOf(id);
  
  if (index !== -1) {
    return index + 2; 
  }
  return -1;
}

// ==========================================
// 5. Validation Helpers
// ==========================================
function requireFields(data, fields) {
  const missing = fields.filter(f => data[f] === undefined || data[f] === null || String(data[f]).trim() === "");
  if (missing.length > 0) {
    throw new Error("Missing required fields: " + missing.join(", "));
  }
}

function parseNumeric(value, fallback = 0) {
  const num = parseFloat(value);
  return isNaN(num) ? fallback : num;
}