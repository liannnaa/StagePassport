import { CatalogSyncRow } from '../types/performanceContextTypes';
import { syncCatalogFromApi } from '../../../api/stagePassportApi';

export async function syncCatalogOptions(
  _userId: string,
  rows: CatalogSyncRow[]
) {
  return syncCatalogFromApi(rows);
}