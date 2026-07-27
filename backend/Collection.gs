// Spreadsheet columns (13 total, no UUID column):
// 1:RecordID  2:Date  3:WorkerName  4:Item  5:ManualTagNumber  6:GrossWeight
// 7:StoneWeight  8:NetWeight  9:TagWeight  10:Purity  11:TotalPure  12:CreatedAt  13:UpdatedAt

function getCollection() {
  const data = getSheetDataAsObjects("JewelleryCollection");
  return successResponse("Jewellery Collection records fetched", data);
}

// ManualTagNumber is col 5 (index 4 in 0-based), RecordID is col 1 (index 0)
function checkDuplicateManualTag(sheet, tag, excludeRecordId) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;

  const data = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
  for (let row of data) {
    const rowRecordId = row[0];
    const manualTag   = row[4]; // col 5 = ManualTagNumber
    if (String(manualTag).trim() === String(tag).trim()) {
      if (excludeRecordId === undefined || excludeRecordId === null || excludeRecordId !== rowRecordId) {
        return true;
      }
    }
  }
  return false;
}

function createCollection(data) {
  requireFields(data, ["date", "worker", "item", "manualTag", "grossWeight", "stoneWeight", "purity", "tagWeight"]);

  const sheet = getSheet("JewelleryCollection");

  if (checkDuplicateManualTag(sheet, data.manualTag)) {
    return errorResponse("Duplicate Manual Tag: " + data.manualTag);
  }

  const recordId  = generateRecordId("JewelleryCollection", "JC");
  const createdAt = currentTimestamp();

  const grossWeight = parseNumeric(data.grossWeight);
  const stoneWeight = parseNumeric(data.stoneWeight);
  const purity      = parseNumeric(data.purity);
  const tagWeight   = parseNumeric(data.tagWeight);

  const netWeight = grossWeight - stoneWeight;
  const totalPure = (netWeight * purity) / 100;

  // Must match spreadsheet column order exactly
  const rowData = [
    recordId,       // col 1:  RecordID
    data.date,      // col 2:  Date
    data.worker,    // col 3:  WorkerName
    data.item,      // col 4:  Item
    data.manualTag, // col 5:  ManualTagNumber
    grossWeight,    // col 6:  GrossWeight
    stoneWeight,    // col 7:  StoneWeight
    netWeight,      // col 8:  NetWeight
    tagWeight,      // col 9:  TagWeight
    purity,         // col 10: Purity
    totalPure,      // col 11: TotalPure
    createdAt,      // col 12: CreatedAt
    createdAt       // col 13: UpdatedAt
  ];

  sheet.appendRow(rowData);

  addWorkerIfMissing(data.worker);
  addItemIfMissing(data.item);
  addPurityIfMissing(data.purity);

  return successResponse("Jewellery Collection created successfully.", {
    id:          recordId,
    recordId:    recordId,
    createdAt:   createdAt,
    updatedAt:   createdAt,
    date:        data.date,
    worker:      data.worker,
    item:        data.item,
    manualTag:   data.manualTag,
    grossWeight: grossWeight,
    stoneWeight: stoneWeight,
    netWeight:   netWeight,
    purity:      purity,
    tagWeight:   tagWeight,
    totalPure:   totalPure
  });
}

function updateCollection(data) {
  if (!data.id && !data.recordId) {
    return errorResponse("Record identifier required", "Provide 'id' or 'recordId'");
  }
  requireFields(data, ["date", "worker", "item", "manualTag", "grossWeight", "stoneWeight", "purity", "tagWeight"]);

  const sheet = getSheet("JewelleryCollection");

  // RecordID is col 1 — search there
  const lookupId = data.id || data.recordId;
  const row = findRowByInternalId("JewelleryCollection", lookupId, 1);

  if (row === -1) {
    return errorResponse("Record not found");
  }

  const existingRecordId  = sheet.getRange(row, 1).getValue();
  const existingCreatedAt = sheet.getRange(row, 12).getValue(); // col 12 = CreatedAt

  if (checkDuplicateManualTag(sheet, data.manualTag, existingRecordId)) {
    return errorResponse("Duplicate Manual Tag: " + data.manualTag);
  }

  const updatedAt   = currentTimestamp();
  const grossWeight = parseNumeric(data.grossWeight);
  const stoneWeight = parseNumeric(data.stoneWeight);
  const purity      = parseNumeric(data.purity);
  const tagWeight   = parseNumeric(data.tagWeight);

  const netWeight = grossWeight - stoneWeight;
  const totalPure = (netWeight * purity) / 100;

  const rowData = [
    existingRecordId,  // col 1:  RecordID
    data.date,         // col 2:  Date
    data.worker,       // col 3:  WorkerName
    data.item,         // col 4:  Item
    data.manualTag,    // col 5:  ManualTagNumber
    grossWeight,       // col 6:  GrossWeight
    stoneWeight,       // col 7:  StoneWeight
    netWeight,         // col 8:  NetWeight
    tagWeight,         // col 9:  TagWeight
    purity,            // col 10: Purity
    totalPure,         // col 11: TotalPure
    existingCreatedAt instanceof Date ? existingCreatedAt.toISOString() : existingCreatedAt, // col 12: CreatedAt
    updatedAt          // col 13: UpdatedAt
  ];

  sheet.getRange(row, 1, 1, 13).setValues([rowData]);

  addWorkerIfMissing(data.worker);
  addItemIfMissing(data.item);
  addPurityIfMissing(data.purity);

  return successResponse("Jewellery Collection updated successfully.", {
    id:          existingRecordId,
    recordId:    existingRecordId,
    createdAt:   rowData[11],
    updatedAt:   updatedAt,
    date:        data.date,
    worker:      data.worker,
    item:        data.item,
    manualTag:   data.manualTag,
    grossWeight: grossWeight,
    stoneWeight: stoneWeight,
    netWeight:   netWeight,
    purity:      purity,
    tagWeight:   tagWeight,
    totalPure:   totalPure
  });
}

function deleteCollection(data) {
  if (!data.id && !data.recordId) {
    return errorResponse("Record identifier required", "Provide 'id' or 'recordId'");
  }

  const sheet = getSheet("JewelleryCollection");

  const lookupId = data.id || data.recordId;
  const row = findRowByInternalId("JewelleryCollection", lookupId, 1);

  if (row === -1) {
    return errorResponse("Record not found");
  }

  const values = sheet.getRange(row, 1, 1, 13).getValues()[0];
  const record = {
    id:          values[0],
    recordId:    values[0],
    date:        values[1]  instanceof Date ? values[1].toISOString()  : values[1],
    worker:      values[2],
    item:        values[3],
    manualTag:   values[4],
    grossWeight: values[5],
    stoneWeight: values[6],
    netWeight:   values[7],
    tagWeight:   values[8],
    purity:      values[9],
    totalPure:   values[10],
    createdAt:   values[11] instanceof Date ? values[11].toISOString() : values[11],
    updatedAt:   values[12] instanceof Date ? values[12].toISOString() : values[12]
  };

  sheet.deleteRow(row);

  return successResponse("Jewellery Collection deleted successfully.", record);
}
