# Jewellery Tracking System - API Contract

## 1. Response Formats
Every response from the backend will be delivered with a uniform JSON structure.

### Success Format
```json
{
  "success": true,
  "message": "Descriptive success message.",
  "data": { ... } // Optional data payload (object or array)
}
```

### Error Format
```json
{
  "success": false,
  "message": "Descriptive error message.",
  "error": "Detailed exception string or reason (if available)"
}
```

## 2. Spreadsheet Schema
The backend operates against dedicated Google Sheets. The underlying columns map directly to the JSON payloads.

**GoldDistribution**
| id | recordId | createdAt | updatedAt | date | worker | subWorker | quantity | purity | totalPure |

**JewelleryCollection**
| id | recordId | createdAt | updatedAt | date | worker | item | manualTag | grossWeight | stoneWeight | netWeight | purity | tagWeight | totalPure |

**Workers**
| id | worker | createdAt |

**Items**
| id | item | createdAt |

**Purities**
| id | purity | createdAt |

## 3. Master Data Flow
When a user submits a POST request to either `createDistribution`, `updateDistribution`, `createCollection`, or `updateCollection`, the backend executes the following workflow:
1. Validates the incoming payload.
2. Applies necessary calculations (e.g., `netWeight`, `totalPure`).
3. Updates the transaction sheet (GoldDistribution or JewelleryCollection).
4. Invokes master data auto-save functions.
5. `addWorkerIfMissing(worker)`, `addItemIfMissing(item)`, `addPurityIfMissing(purity)` automatically scan their respective lookup sheets. If the value does not exist, a new row is appended with a generated UUID and ISO-8601 timestamp.
6. Future GET requests to `getWorkers`, `getItems`, or `getPurities` will immediately yield the newly added master data.

## 4. System Endpoints

### 4.1 System & Diagnostic

#### `getVersion` (GET)
**Description:** Returns current API version and health status.
**Request:** `?action=getVersion`
**Response:**
```json
{
  "success": true,
  "message": "Version Info",
  "data": {
    "version": "1.0.0",
    "backend": "Apps Script",
    "status": "healthy"
  }
}
```

#### `healthCheck` (GET)
**Description:** Validates connectivity to the spreadsheet and returns the current backend timestamp.
**Request:** `?action=healthCheck`
**Response:**
```json
{
  "success": true,
  "message": "Health Check",
  "data": {
    "spreadsheet": "connected",
    "timestamp": "2026-07-26T11:45:23.000Z"
  }
}
```

## 5. Master Data Endpoints

#### `getWorkers` (GET)
**Request:** `?action=getWorkers`
**Response:**
```json
{
  "success": true,
  "message": "Workers fetched",
  "data": [
    { "id": "uuid-1234", "worker": "Mahesh", "createdAt": "2026-07-26T11:45:23.000Z" }
  ]
}
```

#### `getItems` (GET)
**Request:** `?action=getItems`
**Response:** Same structure as `getWorkers`.

#### `getPurities` (GET)
**Request:** `?action=getPurities`
**Response:** Same structure as `getWorkers`.

## 6. CRUD Flow: Gold Distribution

#### `getDistribution` (GET)
*Alias: `getAllGold`*
**Request:** `?action=getDistribution`
**Response:** Array of GoldDistribution objects in `data`.

#### `createDistribution` (POST)
**Expected Payload:**
```json
{
  "action": "createDistribution",
  "date": "2026-07-26T00:00:00.000Z",
  "worker": "Mahesh",
  "subWorker": "",
  "quantity": 10.5,
  "purity": 91.6
}
```
*Note: `totalPure` is omitted; backend calculates this automatically.*

**Success Response:**
```json
{
  "success": true,
  "message": "Gold Distribution created successfully.",
  "data": {
    "id": "uuid-abcd...",
    "recordId": "GD000001",
    "createdAt": "2026-07-26T11:45:23.000Z",
    "updatedAt": "2026-07-26T11:45:23.000Z",
    "date": "2026-07-26T00:00:00.000Z",
    "worker": "Mahesh",
    "subWorker": "",
    "quantity": 10.5,
    "purity": 91.6,
    "totalPure": 9.618
  }
}
```

#### `updateDistribution` (POST)
**Expected Payload:**
Same as `createDistribution` but must include `recordId`.
```json
{
  "action": "updateDistribution",
  "recordId": "GD000001",
  "date": "2026-07-26T00:00:00.000Z",
  "worker": "Mahesh",
  ...
}
```

**Success Response:** Returns updated record.
**Error Response:**
```json
{
  "success": false,
  "message": "Record not found",
  "error": null
}
```

#### `deleteDistribution` (POST)
**Expected Payload:**
```json
{
  "action": "deleteDistribution",
  "recordId": "GD000001"
}
```
**Success Response:** Returns the deleted record before removing it.

## 7. CRUD Flow: Jewellery Collection

#### `getCollection` (GET)
*Alias: `getAllCollection`*
**Request:** `?action=getCollection`
**Response:** Array of JewelleryCollection objects in `data`.

#### `createCollection` (POST)
**Expected Payload:**
```json
{
  "action": "createCollection",
  "date": "2026-07-26T00:00:00.000Z",
  "worker": "Mahesh",
  "item": "Ring",
  "manualTag": "R-101",
  "grossWeight": 15.0,
  "stoneWeight": 2.0,
  "purity": 91.6,
  "tagWeight": 0.5
}
```
*Note: `netWeight` and `totalPure` are omitted; backend calculates this automatically.*

**Success Response:**
```json
{
  "success": true,
  "message": "Jewellery Collection created successfully.",
  "data": {
    "id": "uuid-xyz...",
    "recordId": "JC000001",
    "createdAt": "2026-07-26T11:45:23.000Z",
    "updatedAt": "2026-07-26T11:45:23.000Z",
    "date": "2026-07-26T00:00:00.000Z",
    "worker": "Mahesh",
    "item": "Ring",
    "manualTag": "R-101",
    "grossWeight": 15.0,
    "stoneWeight": 2.0,
    "netWeight": 13.0,
    "purity": 91.6,
    "tagWeight": 0.5,
    "totalPure": 11.908
  }
}
```

#### `updateCollection` (POST)
**Expected Payload:** Same as `createCollection` but must include `recordId`.
**Success Response:** Returns updated record.

**Duplicate Tag Error Response (Create/Update):**
```json
{
  "success": false,
  "message": "Duplicate Manual Tag: R-101",
  "error": null
}
```

#### `deleteCollection` (POST)
**Expected Payload:**
```json
{
  "action": "deleteCollection",
  "recordId": "JC000001"
}
```
**Success Response:** Returns the deleted record before removing it.

## 8. Error Codes & Exceptions
All unhandled exceptions (e.g. invalid JSON, missing required fields, or missing sheets) are caught by global try/catch blocks and will return an error format with `error` containing the exception trace.

**Common Expected Errors:**
- `Missing required fields: [...]`
- `Record not found`
- `Duplicate Manual Tag: [Tag]`
- `Invalid Payload`
- `Invalid Action`
- `Sheet not found: [Name]`
