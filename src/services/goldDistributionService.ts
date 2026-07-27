import { GoldDistributionRecord } from '@/types';
import { api, PostNetworkUncertainError } from './api';

/** Wait for `ms` milliseconds — used to give Apps Script time to finish writing
 *  before we re-verify with a GET. */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Map a raw API row (spreadsheet headers or camelCase) to a typed record. */
function mapRow(item: any): GoldDistributionRecord {
  const quantity = Number(item.Quantity ?? item.quantity) || 0;
  const purity   = Number(item.Purity   ?? item.purity)   || 0;

  const rawTotalPure = item.TotalPure ?? item['Total Pure'] ?? item.totalPure;
  const totalPure =
    rawTotalPure !== '' && rawTotalPure !== null && rawTotalPure !== undefined
      ? Number(rawTotalPure)
      : (quantity * purity) / 100; // calculate locally when spreadsheet cell is blank

  // No UUID column in the spreadsheet — RecordID serves as the unique key
  const recordId = item.RecordID || item['Record ID'] || item.recordId || '';

  return {
    id:        item.ID || item.id || recordId,
    recordId,
    date:      item.Date      || item.date      || '',
    worker:    item.WorkerName || item['Worker Name'] || item.Worker || item.worker || '',
    subWorker: item.SubWorker  || item['Sub Worker']  || item.subWorker || '',
    quantity,
    purity,
    totalPure,
    createdAt: item.CreatedAt || item['Created At'] || item.createdAt || '',
    updatedAt: item.UpdatedAt || item['Updated At'] || item.updatedAt || '',
  };
}

export const goldDistributionService = {
  async getAll(): Promise<GoldDistributionRecord[]> {
    const data = await api.get<any[]>('getDistribution');
    return data.map(mapRow);
  },

  async create(
    record: Omit<GoldDistributionRecord, 'id' | 'recordId' | 'createdAt' | 'updatedAt' | 'totalPure'>
  ): Promise<GoldDistributionRecord> {
    const payload = {
      date:      record.date,
      worker:    record.worker,
      subWorker: record.subWorker || '',
      quantity:  record.quantity,
      purity:    record.purity,
    };

    try {
      const response = await api.post<any>('createDistribution', payload);
      // Backend now returns a full record object — map it directly
      return {
        ...mapRow(response),
        // Ensure calculated fields are present even if backend omits them
        totalPure:
          response.totalPure !== undefined
            ? response.totalPure
            : (record.quantity * record.purity) / 100,
      };
    } catch (err: any) {
      if (err instanceof PostNetworkUncertainError) {
        // ─────────────────────────────────────────────────────────────────
        // The Apps Script CORS redirect caused a browser-side CORS error.
        // The WRITE most likely already happened in the spreadsheet.
        // Wait 2.5 s then verify via GET, returning the found record.
        // ─────────────────────────────────────────────────────────────────
        console.warn('[GoldDistribution] POST uncertain — verifying via GET in 2.5 s…');
        await delay(2500);

        try {
          const all = await this.getAll();
          // Find a recently-created row matching the submitted values
          const found = all.find(
            (r) =>
              r.worker    === record.worker &&
              Math.abs(r.quantity - record.quantity) < 0.001 &&
              Math.abs(r.purity   - record.purity)   < 0.001
          );
          if (found) {
            console.info('[GoldDistribution] Record confirmed in sheet — treating POST as success.');
            return found;
          }
        } catch {
          // GET also failed — fall through to original error
        }
      }

      // Re-surface as a user-facing error
      throw new Error(
        err instanceof PostNetworkUncertainError
          ? 'Network error. Please check your connection.'
          : err.message
      );
    }
  },

  async update(
    id: string,
    record: Omit<GoldDistributionRecord, 'id' | 'recordId' | 'createdAt' | 'updatedAt' | 'totalPure'>,
    existingRecord?: GoldDistributionRecord
  ): Promise<GoldDistributionRecord> {
    let existing = existingRecord;
    if (!existing) {
      const all = await this.getAll();
      existing = all.find((r) => r.id === id);
    }
    if (!existing) throw new Error('Record not found');

    const payload = {
      id:        existing.id,       // RecordID used as primary key (no UUID column)
      recordId:  existing.recordId,
      date:      record.date,
      worker:    record.worker,
      subWorker: record.subWorker || '',
      quantity:  record.quantity,
      purity:    record.purity,
    };

    try {
      const response = await api.post<any>('updateDistribution', payload);
      return {
        ...existing,
        ...record,
        ...mapRow(response),
        id:       response.id       || existing.id,
        recordId: response.recordId || existing.recordId,
        totalPure:
          response.totalPure !== undefined
            ? response.totalPure
            : (record.quantity * record.purity) / 100,
      };
    } catch (err: any) {
      if (err instanceof PostNetworkUncertainError) {
        // Update went through — return the locally-merged record
        const totalPure = (record.quantity * record.purity) / 100;
        return { ...existing, ...record, totalPure };
      }
      throw err;
    }
  },

  async delete(id: string, existingRecord?: GoldDistributionRecord): Promise<void> {
    let existing = existingRecord;
    if (!existing) {
      const all = await this.getAll();
      existing = all.find((r) => r.id === id);
    }
    if (!existing) throw new Error('Record not found');

    try {
      await api.post('deleteDistribution', { id: existing.id, recordId: existing.recordId });
    } catch (err: any) {
      if (err instanceof PostNetworkUncertainError) {
        // Delete likely went through; swallow to avoid false errors
        console.warn('[GoldDistribution] DELETE uncertain — assuming success.');
        return;
      }
      throw err;
    }
  },
};
