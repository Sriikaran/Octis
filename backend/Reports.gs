// Reports.gs
// Kept minimal as the frontend computes all Dashboard, KPIs, and custom Reports logic.

function getAllGold() {
  return getDistribution();
}

function getAllCollection() {
  return getCollection();
}