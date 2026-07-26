function getDistribution() {
  const data = getSheetDataAsObjects("GoldDistribution");
  return successResponse("Gold Distribution records fetched", data);
}

function createDistribution(data) {
  requireFields(data, ["date", "worker", "quantity", "purity"]);

  const sheet = getSheet("GoldDistribution");
  
  const id = generateUUID();
  const recordId = generateRecordId("GoldDistribution", "GD");
  const createdAt = currentTimestamp();
  
  const quantity = parseNumeric(data.quantity);
  const purity = parseNumeric(data.purity);
  const totalPure = (quantity * purity) / 100;
  
  const rowData = [
    id,
    recordId,
    createdAt,
    createdAt,
    data.date,
    data.worker,
    data.subWorker || "",
    quantity,
    purity,
    totalPure
  ];

  sheet.appendRow(rowData);
  
  addWorkerIfMissing(data.worker);
  addPurityIfMissing(data.purity);

  const record = {
    id: id,
    recordId: recordId,
    createdAt: createdAt,
    updatedAt: createdAt,
    date: data.date,
    worker: data.worker,
    subWorker: data.subWorker || "",
    quantity: quantity,
    purity: purity,
    totalPure: totalPure
  };

  return successResponse("Gold Distribution created successfully.", record);
}

function updateDistribution(data) {
  if (!data.id && !data.recordId) {
    return errorResponse("Record identifier required", "Provide 'id' (UUID) or 'recordId'");
  }
  requireFields(data, ["date", "worker", "quantity", "purity"]);

  const sheet = getSheet("GoldDistribution");
  
  // Try UUID (col 1) first, then RecordID (col 2) for legacy rows
  let row = -1;
  if (data.id) {
    row = findRowByInternalId("GoldDistribution", data.id, 1);
  }
  if (row === -1 && data.recordId) {
    row = findRowByInternalId("GoldDistribution", data.recordId, 2);
  }
  
  if (row === -1) {
    return errorResponse("Record not found");
  }

  const existingId = sheet.getRange(row, 1).getValue();
  const existingCreatedAt = sheet.getRange(row, 3).getValue();
  
  const updatedAt = currentTimestamp();
  const quantity = parseNumeric(data.quantity);
  const purity = parseNumeric(data.purity);
  const totalPure = (quantity * purity) / 100;
  
  const rowData = [
    existingId,
    data.recordId,
    existingCreatedAt instanceof Date ? existingCreatedAt.toISOString() : existingCreatedAt,
    updatedAt,
    data.date,
    data.worker,
    data.subWorker || "",
    quantity,
    purity,
    totalPure
  ];
  
  sheet.getRange(row, 1, 1, 10).setValues([rowData]);
  
  addWorkerIfMissing(data.worker);
  addPurityIfMissing(data.purity);

  const record = {
    id: existingId,
    recordId: data.recordId,
    createdAt: rowData[2],
    updatedAt: updatedAt,
    date: data.date,
    worker: data.worker,
    subWorker: data.subWorker || "",
    quantity: quantity,
    purity: purity,
    totalPure: totalPure
  };

  return successResponse("Gold Distribution updated successfully.", record);
}

function deleteDistribution(data) {
  if (!data.id && !data.recordId) {
    return errorResponse("Record identifier required", "Provide 'id' (UUID) or 'recordId'");
  }

  const sheet = getSheet("GoldDistribution");
  
  // Try UUID (col 1) first, then RecordID (col 2) for legacy rows
  let row = -1;
  if (data.id) {
    row = findRowByInternalId("GoldDistribution", data.id, 1);
  }
  if (row === -1 && data.recordId) {
    row = findRowByInternalId("GoldDistribution", data.recordId, 2);
  }
  
  if (row === -1) {
    return errorResponse("Record not found");
  }
  
  const values = sheet.getRange(row, 1, 1, 10).getValues()[0];
  const record = {
    id: values[0],
    recordId: values[1],
    createdAt: values[2] instanceof Date ? values[2].toISOString() : values[2],
    updatedAt: values[3] instanceof Date ? values[3].toISOString() : values[3],
    date: values[4] instanceof Date ? values[4].toISOString() : values[4],
    worker: values[5],
    subWorker: values[6],
    quantity: values[7],
    purity: values[8],
    totalPure: values[9]
  };

  sheet.deleteRow(row);

  return successResponse("Gold Distribution deleted successfully.", record);
}