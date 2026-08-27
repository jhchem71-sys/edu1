import * as XLSX from 'xlsx';
import { RawReagentRecord } from '../types';
import { parseCsvText, ParseResult } from './csvParser';

/**
 * Reads an Excel file buffer, converts the first sheet to CSV text, and parses it.
 */
export async function parseExcelFile(file: File): Promise<ParseResult> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('엑셀 파일에 시트가 존재하지 않습니다.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  // Convert worksheet to CSV string with raw values
  const csvText = XLSX.utils.sheet_to_csv(worksheet, {
    blankrows: false,
    dateNF: 'YYYY-MM-DD'
  });

  return parseCsvText(csvText);
}
