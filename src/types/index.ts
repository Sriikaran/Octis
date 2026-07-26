export interface Worker {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  name: string;
  category: string;
  code: string;
}

export interface GoldDistributionRecord {
  id: string; // React key, internal reference
  recordId: string; // GDXXXXXX
  createdAt: string;
  updatedAt: string;
  date: string;
  worker: string;
  subWorker?: string;
  quantity: number;
  purity: number;
  totalPure: number;
}

export interface JewelleryCollectionRecord {
  id: string; // React key, internal reference
  recordId: string; // JCXXXXXX
  createdAt: string;
  updatedAt: string;
  date: string;
  worker: string;
  item: string;
  manualTag: string;
  grossWeight: number;
  stoneWeight: number;
  netWeight: number;
  purity: number;
  tagWeight: number;
  totalPure: number;
}
