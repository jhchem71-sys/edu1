import {
  RawReagentRecord,
  EvaluatedReagentRecord,
  DuplicateGroupInfo,
  SummaryStats,
  FilterConfig,
  ExpiryState,
  QtyState
} from '../types';

export const BASE_DATE = '2026-08-27';

/**
 * Parses YYYY-MM-DD (or YYYY/MM/DD) into integer days since Unix epoch.
 * Uses Date.UTC to guarantee timezone-independent date arithmetic.
 */
export function dateStringToDays(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  const clean = dateStr.trim().replace(/\//g, '-').split(' ')[0];
  const parts = clean.split('-');
  if (parts.length < 3) return null;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  return Math.floor(Date.UTC(y, m - 1, d) / (1000 * 60 * 60 * 24));
}

const BASE_DATE_DAYS = dateStringToDays(BASE_DATE)!;

/**
 * Calculates D-day difference integer.
 * D = (expiry_date - BASE_DATE)
 */
export function calculateDDay(expiryDateStr?: string | null): { dDay: number | null; dDayLabel: string } {
  if (!expiryDateStr || expiryDateStr.trim() === '') {
    return { dDay: null, dDayLabel: '유효기간 미기재' };
  }
  const expDays = dateStringToDays(expiryDateStr);
  if (expDays === null) {
    return { dDay: null, dDayLabel: '유효기간 미기재' };
  }
  const d = expDays - BASE_DATE_DAYS;
  if (d > 0) {
    return { dDay: d, dDayLabel: `D-${d}` };
  } else if (d === 0) {
    return { dDay: 0, dDayLabel: 'D-DAY' };
  } else {
    return { dDay: d, dDayLabel: `D+${Math.abs(d)}` };
  }
}

/**
 * Evaluates expiry zone:
 * D = null -> '유효기간 미기재'
 * D <= 0 -> '만료' (D=0 is 만료)
 * 0 < D <= 30 -> '임박'
 * D > 30 -> '정상'
 */
export function evaluateExpiryState(dDay: number | null): ExpiryState {
  if (dDay === null) return '유효기간 미기재';
  if (dDay <= 0) return '만료';
  if (dDay <= 30) return '임박';
  return '정상';
}

/**
 * Evaluates quantity rate and status:
 * remain_qty == null -> '잔량 미기재'
 * init_qty <= 0 or null -> '데이터 오류'
 * remain_rate > 100 -> '데이터 오류'
 * 0 <= remain_rate <= 20 -> '부족'
 * 20 < remain_rate <= 100 -> '정상'
 */
export function evaluateQty(
  initQty: number | null,
  remainQty: number | null
): {
  remain_rate: number | null;
  remain_rate_display: string;
  qty_state: QtyState;
} {
  if (initQty === null || initQty <= 0) {
    return {
      remain_rate: null,
      remain_rate_display: '-',
      qty_state: '데이터 오류'
    };
  }

  if (remainQty === null || isNaN(remainQty)) {
    return {
      remain_rate: null,
      remain_rate_display: '-',
      qty_state: '잔량 미기재'
    };
  }

  const rate = (remainQty / initQty) * 100;
  const rateDisplay = `${rate.toFixed(1)}%`;

  if (rate > 100) {
    return {
      remain_rate: rate,
      remain_rate_display: rateDisplay,
      qty_state: '데이터 오류'
    };
  } else if (rate >= 0 && rate <= 20) {
    return {
      remain_rate: rate,
      remain_rate_display: rateDisplay,
      qty_state: '부족'
    };
  } else {
    return {
      remain_rate: rate,
      remain_rate_display: rateDisplay,
      qty_state: '정상'
    };
  }
}

/**
 * Detects duplicate candidates by grouping raw reagent_name per cas_no.
 * Does NOT normalize names to detect exact Unicode and textual variations.
 */
export function findDuplicateCasGroups(rawRecords: RawReagentRecord[]): Map<string, string[]> {
  const casToNamesMap = new Map<string, Set<string>>();

  for (const record of rawRecords) {
    const cas = record.cas_no?.trim();
    const name = record.reagent_name;
    if (!cas || !name) continue;

    if (!casToNamesMap.has(cas)) {
      casToNamesMap.set(cas, new Set<string>());
    }
    casToNamesMap.get(cas)!.add(name);
  }

  const duplicateMap = new Map<string, string[]>();
  for (const [cas, nameSet] of casToNamesMap.entries()) {
    if (nameSet.size >= 2) {
      duplicateMap.set(cas, Array.from(nameSet));
    }
  }

  return duplicateMap;
}

/**
 * Fully evaluates all records and builds statistics & duplicate groups.
 */
export function evaluateAllRecords(rawRecords: RawReagentRecord[]): {
  evaluatedRecords: EvaluatedReagentRecord[];
  duplicateGroups: DuplicateGroupInfo[];
  stats: SummaryStats;
} {
  const duplicateCasMap = findDuplicateCasGroups(rawRecords);

  const evaluatedRecords: EvaluatedReagentRecord[] = rawRecords.map((record) => {
    const { dDay, dDayLabel } = calculateDDay(record.expiry_date);
    const expiry_state = evaluateExpiryState(dDay);

    const { remain_rate, remain_rate_display, qty_state } = evaluateQty(
      record.init_qty,
      record.remain_qty
    );

    const isDuplicate = Boolean(record.cas_no && duplicateCasMap.has(record.cas_no.trim()));

    // Check date reversal
    let isDateReversed = false;
    if (record.receipt_date && record.expiry_date) {
      const recDays = dateStringToDays(record.receipt_date);
      const expDays = dateStringToDays(record.expiry_date);
      if (recDays !== null && expDays !== null && recDays > expDays) {
        isDateReversed = true;
      }
    }

    // Missing data check (expiry_date empty OR remain_qty empty)
    const isMissingData =
      !record.expiry_date ||
      record.expiry_date.trim() === '' ||
      record.remain_qty === null ||
      isNaN(record.remain_qty);

    // Calculate warn_rank
    // 0: 만료, 1: 데이터 오류, 2: 부족, 3: 임박, 4: 중복 후보, 5: 정상
    const ranks: number[] = [];
    if (expiry_state === '만료') ranks.push(0);
    if (qty_state === '데이터 오류') ranks.push(1);
    if (qty_state === '부족') ranks.push(2);
    if (expiry_state === '임박') ranks.push(3);
    if (isDuplicate) ranks.push(4);
    if (ranks.length === 0) ranks.push(5);

    const warn_rank = Math.min(...ranks);

    return {
      ...record,
      dDay,
      dDayLabel,
      expiry_state,
      remain_rate,
      remain_rate_display,
      qty_state,
      is_duplicate_candidate: isDuplicate,
      duplicate_group_cas: isDuplicate ? record.cas_no.trim() : undefined,
      is_date_reversed: isDateReversed,
      is_missing_data: isMissingData,
      warn_rank
    };
  });

  // Build duplicate group structures
  const duplicateGroups: DuplicateGroupInfo[] = [];
  for (const [cas, names] of duplicateCasMap.entries()) {
    const groupRecords = evaluatedRecords.filter((r) => r.cas_no?.trim() === cas);
    const pairCount = (names.length * (names.length - 1)) / 2;

    const totalRemainByUnit: Record<string, number> = {};
    for (const r of groupRecords) {
      if (r.remain_qty !== null && !isNaN(r.remain_qty)) {
        const unit = r.qty_unit || 'g';
        totalRemainByUnit[unit] = (totalRemainByUnit[unit] || 0) + r.remain_qty;
      }
    }

    duplicateGroups.push({
      cas_no: cas,
      names,
      recordsCount: groupRecords.length,
      pairCount,
      records: groupRecords,
      totalRemainByUnit
    });
  }

  // Summary statistics
  const stats: SummaryStats = {
    totalCount: evaluatedRecords.length,
    expiredCount: evaluatedRecords.filter((r) => r.expiry_state === '만료').length,
    impendingCount: evaluatedRecords.filter((r) => r.expiry_state === '임박').length,
    shortageCount: evaluatedRecords.filter((r) => r.qty_state === '부족').length,
    dataErrorCount: evaluatedRecords.filter((r) => r.qty_state === '데이터 오류').length,
    duplicateGroupCount: duplicateGroups.length,
    missingDataCount: evaluatedRecords.filter((r) => r.is_missing_data).length
  };

  return { evaluatedRecords, duplicateGroups, stats };
}

/**
 * Filter and sort evaluated records
 */
export function filterAndSortRecords(
  records: EvaluatedReagentRecord[],
  filter: FilterConfig
): EvaluatedReagentRecord[] {
  let result = records.filter((item) => {
    // Search query
    if (filter.search.trim()) {
      const q = filter.search.trim().toLowerCase();
      const matchName = item.reagent_name?.toLowerCase().includes(q);
      const matchCas = item.cas_no?.toLowerCase().includes(q);
      const matchLoc = item.location?.toLowerCase().includes(q);
      const matchEmp = item.emp_name?.toLowerCase().includes(q);
      const matchId = item.reagent_id?.toLowerCase().includes(q);
      if (!matchName && !matchCas && !matchLoc && !matchEmp && !matchId) {
        return false;
      }
    }

    // Warning filter
    if (filter.warningFilter !== 'ALL') {
      if (filter.warningFilter === '만료' && item.expiry_state !== '만료') return false;
      if (filter.warningFilter === '임박' && item.expiry_state !== '임박') return false;
      if (filter.warningFilter === '부족' && item.qty_state !== '부족') return false;
      if (filter.warningFilter === '데이터 오류' && item.qty_state !== '데이터 오류') return false;
      if (filter.warningFilter === '중복 후보' && !item.is_duplicate_candidate) return false;
      if (filter.warningFilter === '결측' && !item.is_missing_data) return false;
      if (filter.warningFilter === '정상' && (item.warn_rank < 5 || item.is_missing_data)) return false;
    }

    // Hazard filter
    if (filter.hazardFilter !== 'ALL') {
      if (item.hazard_class !== filter.hazardFilter) return false;
    }

    // Temp filter
    if (filter.tempFilter !== 'ALL') {
      if (item.storage_temp !== filter.tempFilter) return false;
    }

    // Lab filter
    if (filter.labFilter !== 'ALL') {
      if (!item.location?.startsWith(filter.labFilter)) return false;
    }

    return true;
  });

  // Sort
  result.sort((a, b) => {
    const dir = filter.sortOrder === 'asc' ? 1 : -1;

    if (filter.sortBy === 'warn_rank') {
      // Default sort sequence: warn_rank ASC, dDay ASC (null last), remain_rate ASC (null last), reagent_id ASC
      if (a.warn_rank !== b.warn_rank) {
        return (a.warn_rank - b.warn_rank) * dir;
      }
      // secondary: dDay asc (nulls last)
      const dA = a.dDay;
      const dB = b.dDay;
      if (dA !== dB) {
        if (dA === null) return 1;
        if (dB === null) return -1;
        return (dA - dB) * dir;
      }
      // tertiary: remain_rate asc (nulls last)
      const rA = a.remain_rate;
      const rB = b.remain_rate;
      if (rA !== rB) {
        if (rA === null) return 1;
        if (rB === null) return -1;
        return (rA - rB) * dir;
      }
      // quaternary: reagent_id asc
      return a.reagent_id.localeCompare(b.reagent_id, 'ko') * dir;
    }

    if (filter.sortBy === 'dDay') {
      const dA = a.dDay;
      const dB = b.dDay;
      if (dA === null && dB === null) return a.reagent_id.localeCompare(b.reagent_id);
      if (dA === null) return 1;
      if (dB === null) return -1;
      if (dA !== dB) return (dA - dB) * dir;
      return a.reagent_id.localeCompare(b.reagent_id);
    }

    if (filter.sortBy === 'remain_rate') {
      const rA = a.remain_rate;
      const rB = b.remain_rate;
      if (rA === null && rB === null) return a.reagent_id.localeCompare(b.reagent_id);
      if (rA === null) return 1;
      if (rB === null) return -1;
      if (rA !== rB) return (rA - rB) * dir;
      return a.reagent_id.localeCompare(b.reagent_id);
    }

    if (filter.sortBy === 'reagent_id') {
      return a.reagent_id.localeCompare(b.reagent_id, 'ko', { numeric: true }) * dir;
    }

    if (filter.sortBy === 'reagent_name') {
      return a.reagent_name.localeCompare(b.reagent_name, 'ko') * dir;
    }

    if (filter.sortBy === 'receipt_date') {
      return a.receipt_date.localeCompare(b.receipt_date) * dir;
    }

    if (filter.sortBy === 'expiry_date') {
      const eA = a.expiry_date || '';
      const eB = b.expiry_date || '';
      if (!eA && !eB) return a.reagent_id.localeCompare(b.reagent_id);
      if (!eA) return 1;
      if (!eB) return -1;
      return eA.localeCompare(eB) * dir;
    }

    return 0;
  });

  return result;
}

/**
 * Format order candidates for copying to clipboard (TSV format)
 */
export function formatOrderCandidatesTSV(records: EvaluatedReagentRecord[]): string {
  const candidates = records.filter(
    (r) => r.expiry_state === '만료' || r.expiry_state === '임박' || r.qty_state === '부족'
  );

  const header = ['시약ID', '시약명', 'CAS번호', '보관위치', '초기량', '현재잔량', '단위', '유효기간', 'D-Day', '상태구분', '담당자', '비고'].join('\t');

  const rows = candidates.map((r) => {
    const reasons: string[] = [];
    if (r.expiry_state === '만료') reasons.push('유효기간 만료');
    if (r.expiry_state === '임박') reasons.push('유효기간 임박');
    if (r.qty_state === '부족') reasons.push('잔량 부족');

    return [
      r.reagent_id,
      r.reagent_name,
      r.cas_no,
      r.location,
      r.init_qty !== null ? r.init_qty : '',
      r.remain_qty !== null ? r.remain_qty : '',
      r.qty_unit,
      r.expiry_date || '',
      r.dDayLabel,
      reasons.join(', '),
      r.emp_name,
      r.remark || ''
    ].join('\t');
  });

  return [header, ...rows].join('\n');
}
