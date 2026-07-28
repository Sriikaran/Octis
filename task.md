# Final Stabilization Phase: Master Data Refactoring

- [x] **Backend Architecture**
  - [x] Create POST endpoints (`createWorker`, `createItem`, `createPurity`).
  - [x] Create POST endpoints (`deleteWorker`, `deleteItem`, `deletePurity`).
  - [x] Add server-side safety checks preventing deletion if used in transactions.
  - [x] Prevent duplicates.
  - [x] Return deterministic IDs and sorted lists.
  - [x] Remove side-effects (`add*IfMissing`) from transaction routes (`createDistribution`, etc.).
  
- [x] **Frontend Architecture**
  - [x] Update `masterDataService` to expose create/delete methods and invalidate cache.
  - [x] Update `masterDataService` getters to sort results alphabetically/numerically.
  - [x] Update `CreatableDropdown` to add '✕' delete button with `ConfirmationDialog`.
  - [x] Propagate `isCreating` and `isDeleting` loading states to disable UI.
  
- [x] **Page Integration**
  - [x] Wire up async logic in `GoldDistributionPage`.
  - [x] Wire up async logic in `JewelleryCollectionPage`.

- [ ] **Next Steps: Deployment**
  - [ ] Generate deployment instructions for the user (redeploy Apps Script).
