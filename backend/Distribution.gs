// Spreadsheet columns (9 total, no UUID column):
// 1:RecordID  2:Date  3:WorkerName  4:SubWorker  5:Quantity  6:Purity  7:TotalPure  8:CreatedAt  9:UpdatedAt

function getDistribution() {
  const data = getSheetDataAsObjects("GoldDistribution");
  return successResponse("Gold Distribution records fetched", data);
}

function createDistribution(data) {
  requireFields(data, ["date", "worker", "quantity", "purity"]);

  const sheet = getSheet("GoldDistribution");

  const recordId = generateRecordId("GoldDistribution", "GD");
  const createdAt = currentTimestamp();

  const quantity = parseNumeric(data.quantity);
  const purity   = parseNumeric(data.purity);
  const totalPure = (quantity * purity) / 100;

  // Must match spreadsheet column order exactly
  const rowData = [
    recordId,             // col 1: RecordID
    data.date,            // col 2: Date
    data.worker,          // col 3: WorkerName
    data.subWorker || "", // col 4: SubWorker
    quantity,             // col 5: Quantity
    purity,               // col 6: Purity
    totalPure,            // col 7: TotalPure
    createdAt,            // col 8: CreatedAt
    createdAt             // col 9: UpdatedAt
  ];

  sheet.appendRow(rowData);

  addWorkerIfMissing(data.worker);
  addPurityIfMissing(data.purity);

  return successResponse("Gold Distribution created successfully.", {
    id:        recordId,
    recordId:  recordId,
    createdAt: createdAt,
    updatedAt: createdAt,
    date:      data.date,
    worker:    data.worker,
    subWorker: data.subWorker || "",
    quantity:  quantity,
    purity:    purity,
    totalPure: totalPure
  });
}

function updateDistribution(data) {
  if (!data.id && !data.recordId) {
    return errorResponse("Record identifier required", "Provide 'id' or 'recordId'");
  }
  requireFields(data, ["date", "worker", "quantity", "purity"]);

  const sheet = getSheet("GoldDistribution");

  // RecordID is col 1 — search there
  const lookupId = data.id || data.recordId;
  const row = findRowByInternalId("GoldDistribution", lookupId, 1);

  if (row === -1) {
    return errorResponse("Record not found");
  }

  const existingRecordId  = sheet.getRange(row, 1).getValue();
  const existingCreatedAt = sheet.getRange(row, 8).getValue(); // col 8 = CreatedAt

  const updatedAt = currentTimestamp();
  const quantity  = parseNumeric(data.quantity);
  const purity    = parseNumeric(data.purity);
  const totalPure = (quantity * purity) / 100;

  const rowData = [
    existingRecordId,                                                              // col 1: RecordID
    data.date,                                                                     // col 2: Date
    data.worker,                                                                   // col 3: WorkerName
    data.subWorker || "",                                                          // col 4: SubWorker
    quantity,                                                                      // col 5: Quantity
    purity,                                                                        // col 6: Purity
    totalPure,                                                                     // col 7: TotalPure
    existingCreatedAt instanceof Date ? existingCreatedAt.toISOString() : existingCreatedAt, // col 8: CreatedAt
    updatedAt                                                                      // col 9: UpdatedAt
  ];

  sheet.getRange(row, 1, 1, 9).setValues([rowData]);

  addWorkerIfMissing(data.worker);
  addPurityIfMissing(data.purity);

  return successResponse("Gold Distribution updated successfully.", {
    id:        existingRecordId,
    recordId:  existingRecordId,
    createdAt: rowData[7],
    updatedAt: updatedAt,
    date:      data.date,
    worker:    data.worker,
    subWorker: data.subWorker || "",
    quantity:  quantity,
    purity:    purity,
    totalPure: totalPure
  });
}

function deleteDistribution(data) {
  if (!data.id && !data.recordId) {
    return errorResponse("Record identifier required", "Provide 'id' or 'recordId'");
  }

  const sheet = getSheet("GoldDistribution");

  const lookupId = data.id || data.recordId;
  const row = findRowByInternalId("GoldDistribution", lookupId, 1);

  if (row === -1) {
    return errorResponse("Record not found");
  }

  const values = sheet.getRange(row, 1, 1, 9).getValues()[0];
  const record = {
    id:        values[0],
    recordId:  values[0],
    date:      values[1] instanceof Date ? values[1].toISOString() : values[1],
    worker:    values[2],
    subWorker: values[3],
    quantity:  values[4],
    purity:    values[5],
    totalPure: values[6],
    createdAt: values[7] instanceof Date ? values[7].toISOString() : values[7],
    updatedAt: values[8] instanceof Date ? values[8].toISOString() : values[8]
  };

  sheet.deleteRow(row);

  return successResponse("Gold Distribution deleted successfully.", record);
}