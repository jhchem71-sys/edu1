import { RawReagentRecord } from '../types';

export interface ParseResult {
  records: RawReagentRecord[];
  totalRows: number;
  validRows: number;
  missingDataRows: number;
  duplicateIdRows: number;
  warnings: string[];
  headers: string[];
  detectedDelimiter: string;
}

const KNOWN_HEADER_MAP: Record<string, keyof RawReagentRecord> = {
  reagent_id: 'reagent_id',
  시약id: 'reagent_id',
  id: 'reagent_id',
  관리번호: 'reagent_id',
  
  reagent_name: 'reagent_name',
  시약명: 'reagent_name',
  물질명: 'reagent_name',
  name: 'reagent_name',
  
  cas_no: 'cas_no',
  cas번호: 'cas_no',
  cas: 'cas_no',
  cas_number: 'cas_no',
  
  hazard_class: 'hazard_class',
  위험물등급: 'hazard_class',
  위험물: 'hazard_class',
  hazard: 'hazard_class',
  
  storage_temp: 'storage_temp',
  보관조건: 'storage_temp',
  보관온도: 'storage_temp',
  temp: 'storage_temp',
  
  location: 'location',
  보관위치: 'location',
  위치: 'location',
  시약장: 'location',
  
  init_qty: 'init_qty',
  초기입고량: 'init_qty',
  초기량: 'init_qty',
  입고량: 'init_qty',
  
  remain_qty: 'remain_qty',
  현재잔량: 'remain_qty',
  잔량: 'remain_qty',
  
  qty_unit: 'qty_unit',
  단위: 'qty_unit',
  unit: 'qty_unit',
  
  receipt_date: 'receipt_date',
  입고일자: 'receipt_date',
  입고일: 'receipt_date',
  
  expiry_date: 'expiry_date',
  유효기간: 'expiry_date',
  만료일: 'expiry_date',
  사용기한: 'expiry_date',
  
  emp_name: 'emp_name',
  담당자: 'emp_name',
  관리자: 'emp_name',
  
  remark: 'remark',
  비고: 'remark',
  메모: 'remark'
};

/**
 * Parses a single CSV line respecting quotes.
 */
function parseCSVLine(line: string, delimiter: string = ','): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Detects delimiter (comma, tab, semicolon)
 */
function detectDelimiter(firstFewLines: string[]): string {
  const line = firstFewLines[0] || '';
  const commaCount = (line.match(/,/g) || []).length;
  const tabCount = (line.match(/\t/g) || []).length;
  const semiCount = (line.match(/;/g) || []).length;

  if (tabCount > commaCount && tabCount > semiCount) return '\t';
  if (semiCount > commaCount && semiCount > tabCount) return ';';
  return ',';
}

function parseNumber(val: string): number | null {
  if (!val) return null;
  const clean = val.replace(/,/g, '').trim();
  if (clean === '' || clean === '-' || clean.toLowerCase() === 'n/a' || clean.toLowerCase() === 'null') {
    return null;
  }
  const n = parseFloat(clean);
  return isNaN(n) ? null : n;
}

function parseDate(val: string): string | null {
  if (!val) return null;
  const clean = val.trim().replace(/\//g, '-').split(' ')[0];
  if (clean === '' || clean === '-' || clean.toLowerCase() === 'n/a') {
    return null;
  }
  // Validate basic format YYYY-MM-DD
  const parts = clean.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    const y = parts[0];
    const m = parts[1].padStart(2, '0');
    const d = parts[2].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return clean;
}

export function parseCsvText(rawText: string, customHeaderMap?: Record<string, keyof RawReagentRecord>): ParseResult {
  const warnings: string[] = [];
  const cleanText = rawText.replace(/^\uFEFF/, ''); // Strip UTF-8 BOM
  const rawLines = cleanText.split(/\r?\n/).filter((l) => l.trim().length > 0);

  if (rawLines.length === 0) {
    return {
      records: [],
      totalRows: 0,
      validRows: 0,
      missingDataRows: 0,
      duplicateIdRows: 0,
      warnings: ['데이터가 비어 있습니다.'],
      headers: [],
      detectedDelimiter: ','
    };
  }

  // Cap at 1000 lines as per PRD 4.1
  const linesToProcess = rawLines.slice(0, 1001);
  if (rawLines.length > 1001) {
    warnings.push(`1,000행을 초과하여 상위 1,000행만 처리되었습니다. (전체 ${rawLines.length - 1}행)`);
  }

  const delimiter = detectDelimiter(linesToProcess.slice(0, 5));
  const headerLine = linesToProcess[0];
  const headerCols = parseCSVLine(headerLine, delimiter).map((h) => h.trim());

  // Map header columns to record properties
  const fieldMapping: (keyof RawReagentRecord | null)[] = headerCols.map((header) => {
    const norm = header.toLowerCase().replace(/[\s_\-·]/g, '');
    if (customHeaderMap && customHeaderMap[header]) {
      return customHeaderMap[header];
    }
    for (const [k, field] of Object.entries(KNOWN_HEADER_MAP)) {
      const normKey = k.toLowerCase().replace(/[\s_\-·]/g, '');
      if (norm === normKey) {
        return field;
      }
    }
    return null;
  });

  const records: RawReagentRecord[] = [];
  const seenIds = new Set<string>();
  let duplicateIdCount = 0;
  let missingDataCount = 0;

  for (let i = 1; i < linesToProcess.length; i++) {
    const line = linesToProcess[i];
    const cells = parseCSVLine(line, delimiter);

    const rawObj: Partial<RawReagentRecord> = {
      reagent_id: `RG-${String(i).padStart(3, '0')}`,
      reagent_name: '미지정 시약',
      cas_no: '000-00-0',
      hazard_class: '해당없음',
      storage_temp: 'RT',
      location: 'LAB-1 A-01',
      init_qty: 100,
      remain_qty: null,
      qty_unit: 'g',
      receipt_date: '2026-08-27',
      expiry_date: null,
      emp_name: '관리자',
      remark: ''
    };

    cells.forEach((cellVal, colIdx) => {
      const field = fieldMapping[colIdx];
      if (!field) return;

      const trimmed = cellVal.trim();
      if (field === 'init_qty' || field === 'remain_qty') {
        rawObj[field] = parseNumber(trimmed);
      } else if (field === 'receipt_date' || field === 'expiry_date') {
        rawObj[field] = parseDate(trimmed);
      } else if (field === 'reagent_name') {
        // Keep exact raw string without trimming inner characters to preserve Unicode
        rawObj[field] = cellVal;
      } else {
        rawObj[field] = trimmed;
      }
    });

    const finalRecord = rawObj as RawReagentRecord;

    if (seenIds.has(finalRecord.reagent_id)) {
      duplicateIdCount++;
    } else {
      seenIds.add(finalRecord.reagent_id);
    }

    if (!finalRecord.expiry_date || finalRecord.remain_qty === null) {
      missingDataCount++;
    }

    records.push(finalRecord);
  }

  return {
    records,
    totalRows: records.length,
    validRows: records.length,
    missingDataRows: missingDataCount,
    duplicateIdRows: duplicateIdCount,
    warnings,
    headers: headerCols,
    detectedDelimiter: delimiter
  };
}

/**
 * Converts records to CSV string for export
 */
export function exportToCsvText(records: RawReagentRecord[]): string {
  const headers = [
    'reagent_id',
    'reagent_name',
    'cas_no',
    'hazard_class',
    'storage_temp',
    'location',
    'init_qty',
    'remain_qty',
    'qty_unit',
    'receipt_date',
    'expiry_date',
    'emp_name',
    'remark'
  ];

  const escapeCell = (val: any) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = records.map((r) => [
    escapeCell(r.reagent_id),
    escapeCell(r.reagent_name),
    escapeCell(r.cas_no),
    escapeCell(r.hazard_class),
    escapeCell(r.storage_temp),
    escapeCell(r.location),
    escapeCell(r.init_qty),
    escapeCell(r.remain_qty),
    escapeCell(r.qty_unit),
    escapeCell(r.receipt_date),
    escapeCell(r.expiry_date),
    escapeCell(r.emp_name),
    escapeCell(r.remark)
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}
