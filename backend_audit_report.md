# Backend Audit Report: Jewellery Tracking System

This document outlines the findings of a comprehensive audit of the Google Apps Script backend for the Jewellery Tracking System.

## 1. Repository Structure
The backend repository is cloned and consists of standard Google Apps Script (`.gs`) files:
- `Code.gs`: 1.2 KB
- `Collection.gs`: 0 Bytes (Empty)
- `Distribution.gs`: 2.1 KB
- `Helper.gs`: 1.0 KB
- `MasterData.gs`: 1.8 KB
- `Reports.gs`: 538 Bytes

## 2. Responsibility of Every .gs File

| File | Purpose & Responsibilities | Public Functions | Internal Helpers | Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| **Code.gs** | Acts as the central router/controller for the web app. Handles all incoming HTTP GET (`doGet`) and POST (`doPost`) requests and dispatches them to the appropriate functions based on the `action` parameter. | `doGet(e)`, `doPost(e)` | None | Calls functions in `Distribution.gs`, `Collection.gs`, `MasterData.gs`, `Reports.gs`, and uses `jsonResponse` from `Helper.gs`. |
| **Distribution.gs** | Manages all CRUD operations for the Gold Distribution module. | `getDistribution()`, `createDistribution(data)`, `updateDistribution(data)`, `deleteDistribution(data)` | None | Depends on `Helper.gs` for ID generation, timestamps, row finding, and JSON formatting. Depends on `MasterData.gs` (`saveWorker`, `savePurity`) to auto-save master data. |
| **Collection.gs** | *Intended* to manage CRUD operations for Jewellery Collection. | None (File is empty) | None | N/A |
| **Helper.gs** | Provides core utilities and shared functions used across multiple modules. | None | `jsonResponse(data)`, `getCurrentTimestamp()`, `generateRecordID(sheetName, prefix)`, `findRowByRecordID(sheetName, recordID)` | Standard Apps Script `SpreadsheetApp`, `ContentService`, `Utilities` APIs. |
| **MasterData.gs** | Manages the dynamic dropdown lists (Workers, Items, Purities). Reads master data for the frontend and saves new entries if they do not exist. | `getWorkers()`, `getItems()`, `getPurities()` | `saveWorker(workerName)`, `saveItem(item)`, `savePurity(purity)` | `SpreadsheetApp` and `Helper.gs`. |
| **Reports.gs** | Handles data aggregation for the Dashboard and Reports modules. Currently, it only provides a basic count of rows for the dashboard. | `getDashboard()`, `getReports()` | None | `SpreadsheetApp`, `Helper.gs` |

## 3. Request Flow
The typical request flow follows a single-entry-point routing pattern:

**Frontend**  
&nbsp;&nbsp;↓ *(HTTP GET/POST with JSON payload containing `action`)*  
**Web App URL**  
&nbsp;&nbsp;↓ *(Apps Script Execution)*  
**Code.gs** (`doGet` or `doPost` switch statement)  
&nbsp;&nbsp;↓ *(Dispatches based on `action` e.g., `createDistribution`)*  
**Module File** (e.g., `Distribution.gs` → `createDistribution()`)  
&nbsp;&nbsp;↓ *(Generates ID, Timestamp via `Helper.gs`)*  
&nbsp;&nbsp;↓ *(Auto-saves Master Data via `MasterData.gs`)*  
**Google Spreadsheet** (`SpreadsheetApp` APIs to append or update rows)  
&nbsp;&nbsp;↓ *(Format response)*  
**Code.gs** returns `jsonResponse` back to the Frontend.

## 4. Spreadsheet Structure
*Note: Direct access to the spreadsheet is restricted. The structure below is inferred from the codebase, and missing information is highlighted.*

**Known Sheets (from code references):**
1. `GoldDistribution`
2. `JewelleryCollection`
3. `Workers`
4. `Items`
5. `Purities`

**Columns (Inferred for GoldDistribution based on `appendRow`):**
1. Record ID (`GD0001`)
2. Date
3. Worker Name
4. Sub Worker
5. Quantity
6. Purity
7. Total Pure
8. Created At Timestamp
9. Updated At Timestamp

**Information Needed for Full Inspection:**
To properly map the spreadsheet, I need visual confirmation or API access to verify:
- Are there header rows on every sheet? (The code assumes row 1 is headers).
- What are the exact columns for `JewelleryCollection`?
- Are there hidden audit columns or validation rules applied directly in Google Sheets?
- Is there any frozen row configuration?

## 5. API Endpoints

### GET Endpoints
| Action | Function | Expected Params | Response Format |
| :--- | :--- | :--- | :--- |
| `getDistribution` | `getDistribution()` | `action=getDistribution` | Array of objects mapped to column headers. |
| `getCollection` | `getCollection()` | `action=getCollection` | **Fails** (`getCollection` is undefined). |
| `getWorkers` | `getWorkers()` | `action=getWorkers` | Flat Array of strings (e.g. `["Mahesh", "Ramesh"]`). |
| `getItems` | `getItems()` | `action=getItems` | Flat Array of strings. |
| `getPurities` | `getPurities()` | `action=getPurities` | Flat Array of strings/numbers. |
| `getDashboard` | `getDashboard()` | `action=getDashboard` | `{ totalDistributions: 0, totalCollections: 0 }` |
| `getReports` | `getReports()` | `action=getReports` | `{ message: "Reports API Ready" }` |

### POST Endpoints
| Action | Function | Expected Payload | Success Response | Error Response |
| :--- | :--- | :--- | :--- | :--- |
| `createDistribution` | `createDistribution` | `{ action, date, workerName, subWorker, quantity, purity, totalPure }` | `{ success: true, message: "...", recordID: "GD0001" }` | N/A |
| `updateDistribution` | `updateDistribution` | `{ action, recordID, date, workerName, subWorker, quantity, purity, totalPure }` | `{ success: true, message: "..." }` | `{ success: false, message: "Record not found" }` |
| `deleteDistribution` | `deleteDistribution` | `{ action, recordID }` | `{ success: true, message: "..." }` | `{ success: false, message: "Record not found" }` |
| `createCollection` | `createCollection` | `{ action, ... }` | **Fails** (`Collection.gs` is empty) | **Fails** |
| `updateCollection` | `updateCollection` | `{ action, ... }` | **Fails** | **Fails** |
| `deleteCollection` | `deleteCollection` | `{ action, ... }` | **Fails** | **Fails** |

## 6. Master Data Flow
**Where are they stored?**  
In dedicated Google Sheets: `Workers`, `Items`, and `Purities`.

**How are they created/updated?**  
The `saveWorker`, `saveItem`, and `savePurity` functions check if a value exists in column A of their respective sheets. If not, it uses `appendRow()` to add the new value.

**If a user creates Worker = "Mahesh" inside Jewellery Collection, will Mahesh automatically appear in other modules?**  
**NO.**  
*Reason:* The `Collection.gs` file is completely empty. The functions required to handle Jewellery Collection (`createCollection`) do not exist, and therefore it never calls `saveWorker("Mahesh")`. Even if it were implemented, it would explicitly need to call `saveWorker(data.workerName)` like `createDistribution` does. Currently, creating a worker from Jewellery Collection is impossible on the backend.

## 7. CRUD Operations
- **Create:** Implemented for `GoldDistribution`. Calls `generateRecordID`, formats a timestamp, uses `appendRow`, and syncs master data.
- **Read:** Implemented for `GoldDistribution`. Reads the whole sheet `getDataRange().getValues()`, extracts headers, and maps rows to JSON objects.
- **Update:** Implemented for `GoldDistribution`. Uses a linear search (`findRowByRecordID`) to locate the row. Updates individual cells sequentially using `sheet.getRange(row, col).setValue(val)`.
- **Delete:** Implemented for `GoldDistribution`. Locates the row via `findRowByRecordID` and uses `sheet.deleteRow(row)`.
- **Search / Filtering:** Not implemented in the backend. `getDistribution` returns all rows unconditionally.

*Note: All CRUD for Jewellery Collection is missing.*

## 8. Validation Rules
**Current Backend Validations:**
- **Invalid IDs:** Updates and deletes return a `{ success: false, message: "Record not found" }` if the `recordID` is not found.
- **Empty Master Data:** Master data functions exit early if passed an empty/null value (`if (!workerName) return;`).

**Missing Validations:**
- Duplicate Manual Tags are NOT checked.
- Required fields are NOT enforced.
- Data types (e.g., Purity, Weight must be numbers) are NOT validated.
- Date formats are NOT validated.

## 9. Performance Observations
- **Linear Scans:** `findRowByRecordID` pulls the entire sheet into memory and loops through it `O(N)` to find a record. This will become a bottleneck as the dataset grows.
- **Master Data Checks:** Checking if a worker/purity exists involves reading the entire column into memory every single time a record is created.
- **Slow Updates:** `updateDistribution` uses 7 separate `setValue()` calls. Each call is a distinct API request to Google Sheets, making updates significantly slower than using a single `setValues([[]])` array write.
- **Large Dataset Concerns:** `getDistribution` returns all rows at once without pagination or filtering.

## 10. Security Observations
- **Authentication:** There is no explicit authentication. The endpoint relies on the Google Apps Script deployment permissions (likely "Execute as me, accessible to Anyone"). Anyone with the URL can POST/GET data.
- **Input Sanitization:** None. The backend blindly writes whatever payload it receives to the sheet, risking injection or corruption.
- **Error Handling:** Minimal. No `try/catch` blocks wrap spreadsheet operations. If a sheet is renamed or missing, the entire API will throw an unhandled 500 HTML error rather than a clean JSON response.

## 11. Frontend Compatibility Analysis
- **Already Compatible:**
  - Standard GET and POST `action` routing matches frontend service intentions.
  - Return formats (`success`, `message`, `recordID`) match the frontend expectations.
- **Partially Compatible:**
  - The frontend sends `worker` in the Gold Distribution payload, but `Distribution.gs` expects `workerName` (`data.workerName`). This will result in empty data being saved.
- **Missing Functionality:**
  - `Collection.gs` is completely blank. All Jewellery Collection features will fail.
  - Reports API returns a dummy string instead of calculated data.
  - Dashboard API only returns basic counts, whereas the frontend expects detailed records to calculate KPI trends, Recent Activity, and Top Workers.

## 12. Integration Risks
1. **Payload Property Mismatches:** Frontend keys (`worker`, `subWorker`, etc.) must perfectly align with what the backend attempts to destructure (e.g., `data.workerName`).
2. **Missing Collection API:** The frontend will crash or show errors when trying to create a Jewellery Collection record.
3. **Data Fetching:** The frontend `Reports` and `Dashboard` modules rely on fetching ALL data and processing it client-side. The backend supports fetching all data, but as datasets grow, this will cause memory issues on both ends.

## 13. Recommended Next Steps
Before wiring the frontend to the backend, the following backend changes are highly recommended:
1. Complete `Collection.gs` using the `Distribution.gs` pattern.
2. Align payload parameter names (e.g., `workerName` vs `worker`).
3. Refactor `updateDistribution` to use a bulk `setValues` operation to improve update speed.
4. Implement `try/catch` error handling to guarantee JSON responses on failure.
5. (Optional but recommended) Build server-side search/filtering to prevent the frontend from downloading thousands of rows on every load.
