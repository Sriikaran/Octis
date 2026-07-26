function getCollection() {
  const data = getSheetDataAsObjects("JewelleryCollection");
  return successResponse("Jewellery Collection records fetched", data);
}

function checkDuplicateManualTag(sheet, tag, excludeId = null) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;
  
  // Assumes id is column 1, manualTag is column 8 (schema below)
  const data = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
  for (let row of data) {
    const id = row[0];
    const manualTag = row[7];
    if (String(manualTag).trim() === String(tag).trim()) {
      if (excludeId === null || excludeId !== id) {
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
  
  const id = generateUUID();
  const recordId = generateRecordId("JewelleryCollection", "JC");
  const createdAt = currentTimestamp();
  
  const grossWeight = parseNumeric(data.grossWeight);
  const stoneWeight = parseNumeric(data.stoneWeight);
  const purity = parseNumeric(data.purity);
  const tagWeight = parseNumeric(data.tagWeight);
  
  // Recalculations
  const netWeight = grossWeight - stoneWeight;
  const totalPure = (netWeight * purity) / 100;
  
  const rowData = [
    id,
    recordId,
    createdAt,
    createdAt,
    data.date,
    data.worker,
    data.item,
    data.manualTag,
    grossWeight,
    stoneWeight,
    netWeight,
    purity,
    tagWeight,
    totalPure
  ];

  sheet.appendRow(rowData);
  
  addWorkerIfMissing(data.worker);
  addItemIfMissing(data.item);
  addPurityIfMissing(data.purity);

  const record = {
    id: id,
    recordId: recordId,
    createdAt: createdAt,
    updatedAt: createdAt,
    date: data.date,
    worker: data.worker,
    item: data.item,
    manualTag: data.manualTag,
    grossWeight: grossWeight,
    stoneWeight: stoneWeight,
    netWeight: netWeight,
    purity: purity,
    tagWeight: tagWeight,
    totalPure: totalPure
  };

  return successResponse("Jewellery Collection created successfully.", record);
}

function updateCollection(data) {
  if (!data.id && !data.recordId) {
    return errorResponse("Record identifier required", "Provide 'id' (UUID) or 'recordId'");
  }
  requireFields(data, ["date", "worker", "item", "manualTag", "grossWeight", "stoneWeight", "purity", "tagWeight"]);

  const sheet = getSheet("JewelleryCollection");
  
  // Try UUID (col 1) first, then RecordID (col 2) for legacy rows
  let row = -1;
  if (data.id) {
    row = findRowByInternalId("JewelleryCollection", data.id, 1);
  }
  if (row === -1 && data.recordId) {
    row = findRowByInternalId("JewelleryCollection", data.recordId, 2);
  }
  
  if (row === -1) {
    return errorResponse("Record not found");
  }

  const existingId = sheet.getRange(row, 1).getValue();
  const existingCreatedAt = sheet.getRange(row, 3).getValue();
  
  if (checkDuplicateManualTag(sheet, data.manualTag, existingId)) {
    return errorResponse("Duplicate Manual Tag: " + data.manualTag);
  }
  
  const updatedAt = currentTimestamp();
  const grossWeight = parseNumeric(data.grossWeight);
  const stoneWeight = parseNumeric(data.stoneWeight);
  const purity = parseNumeric(data.purity);
  const tagWeight = parseNumeric(data.tagWeight);
  
  const netWeight = grossWeight - stoneWeight;
  const totalPure = (netWeight * purity) / 100;
  
  const rowData = [
    existingId,
    data.recordId,
    existingCreatedAt instanceof Date ? existingCreatedAt.toISOString() : existingCreatedAt,
    updatedAt,
    data.date,
    data.worker,
    data.item,
    data.manualTag,
    grossWeight,
    stoneWeight,
    netWeight,
    purity,
    tagWeight,
    totalPure
  ];
  
  sheet.getRange(row, 1, 1, 14).setValues([rowData]);
  
  addWorkerIfMissing(data.worker);
  addItemIfMissing(data.item);
  addPurityIfMissing(data.purity);

  const record = {
    id: existingId,
    recordId: data.recordId,
    createdAt: rowData[2],
    updatedAt: updatedAt,
    date: data.date,
    worker: data.worker,
    item: data.item,
    manualTag: data.manualTag,
    grossWeight: grossWeight,
    stoneWeight: stoneWeight,
    netWeight: netWeight,
    purity: purity,
    tagWeight: tagWeight,
    totalPure: totalPure
  };

  return successResponse("Jewellery Collection updated successfully.", record);
}

function deleteCollection(data) {
  if (!data.id && !data.recordId) {
    return errorResponse("Record identifier required", "Provide 'id' (UUID) or 'recordId'");
  }

  const sheet = getSheet("JewelleryCollection");
  
  // Try UUID (col 1) first, then RecordID (col 2) for legacy rows
  let row = -1;
  if (data.id) {
    row = findRowByInternalId("JewelleryCollection", data.id, 1);
  }
  if (row === -1 && data.recordId) {
    row = findRowByInternalId("JewelleryCollection", data.recordId, 2);
  }
  
  if (row === -1) {
    return errorResponse("Record not found");
  }
  
  const values = sheet.getRange(row, 1, 1, 14).getValues()[0];
  const record = {
    id: values[0],
    recordId: values[1],
    createdAt: values[2] instanceof Date ? values[2].toISOString() : values[2],
    updatedAt: values[3] instanceof Date ? values[3].toISOString() : values[3],
    date: values[4] instanceof Date ? values[4].toISOString() : values[4],
    worker: values[5],
    item: values[6],
    manualTag: values[7],
    grossWeight: values[8],
    stoneWeight: values[9],
    netWeight: values[10],
    purity: values[11],
    tagWeight: values[12],
    totalPure: values[13]
  };

  sheet.deleteRow(row);

  return successResponse("Jewellery Collection deleted successfully.", record);
}
