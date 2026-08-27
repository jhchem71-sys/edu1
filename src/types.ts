export type HazardClass = '인화성' | '독성' | '부식성' | '산화성' | '해당없음' | string;
export type StorageTemp = 'RT' | '4℃' | '-20℃' | string;
export type QtyUnit = 'g' | 'mL' | 'kg' | string;

export type ExpiryState = '만료' | '임박' | '정상' | '유효기간 미기재';
export type QtyState = '데이터 오류' | '부족' | '정상' | '잔량 미기재';

export interface RawReagentRecord {
  reagent_id: string;
  reagent_name: string;
  cas_no: string;
  hazard_class: HazardClass;
  storage_temp: StorageTemp;
  location: string;
  init_qty: number | null;
  remain_qty: number | null;
  qty_unit: QtyUnit;
  receipt_date: string;
  expiry_date: string | null;
  emp_name: string;
  remark?: string;
}

export interface DuplicateGroupInfo {
  cas_no: string;
  names: string[];
  recordsCount: number;
  pairCount: number;
  records: EvaluatedReagentRecord[];
  totalRemainByUnit: Record<string, number>;
}

export interface EvaluatedReagentRecord extends RawReagentRecord {
  // Calculated fields
  dDay: number | null; // integer difference in days relative to 2026-08-27
  dDayLabel: string; // "D-30", "D-DAY", "D+15", "-"
  expiry_state: ExpiryState;
  
  remain_rate: number | null; // raw percentage number (e.g. 86.52)
  remain_rate_display: string; // "86.5%" or "-"
  qty_state: QtyState;
  
  is_duplicate_candidate: boolean;
  duplicate_group_cas?: string;
  
  is_date_reversed: boolean; // receipt_date > expiry_date
  is_missing_data: boolean; // expiry_date is empty OR remain_qty is empty
  
  warn_rank: number; // 0: 만료, 1: 데이터 오류, 2: 부족, 3: 임박, 4: 중복 후보, 5: 정상
}

export interface SummaryStats {
  totalCount: number;
  expiredCount: number; // count(expiry_state = '만료')
  impendingCount: number; // count(expiry_state = '임박')
  shortageCount: number; // count(qty_state = '부족')
  dataErrorCount: number; // count(qty_state = '데이터 오류')
  duplicateGroupCount: number; // count(cas_no groups where count(S) >= 2)
  missingDataCount: number; // count(expiry_date empty OR remain_qty empty)
}

export type WarningFilterType = 'ALL' | '만료' | '임박' | '부족' | '데이터 오류' | '중복 후보' | '결측' | '정상';

export interface FilterConfig {
  search: string;
  warningFilter: WarningFilterType;
  hazardFilter: string; // 'ALL' or specific hazard
  tempFilter: string; // 'ALL' or specific temp
  labFilter: string; // 'ALL' or 'LAB-1', 'LAB-2', 'LAB-3'
  sortBy: 'warn_rank' | 'dDay' | 'remain_rate' | 'reagent_id' | 'reagent_name' | 'receipt_date' | 'expiry_date';
  sortOrder: 'asc' | 'desc';
}
