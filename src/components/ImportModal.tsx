import React, { useState, useRef } from 'react';
import { RawReagentRecord } from '../types';
import { parseCsvText, ParseResult } from '../utils/csvParser';
import { parseExcelFile } from '../utils/excelParser';
import { DEFAULT_CSV_TEXT } from '../data/defaultCsv';
import {
  X,
  Upload,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ImportModalProps {
  onClose: () => void;
  onImportComplete: (records: RawReagentRecord[]) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ onClose, onImportComplete }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'preset'>('upload');
  const [pasteText, setPasteText] = useState('');
  const [encoding, setEncoding] = useState<'utf-8' | 'cp949'>('utf-8');
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    try {
      setErrorMsg(null);
      setFileName(file.name);
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (ext === 'xlsx' || ext === 'xls') {
        const res = await parseExcelFile(file);
        setParseResult(res);
      } else {
        // Read as text
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          const res = parseCsvText(text);
          setParseResult(res);
        };
        reader.readAsText(file, encoding);
      }
    } catch (err: any) {
      setErrorMsg(err.message || '파일을 읽는 중 오류가 발생했습니다.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handlePasteParse = () => {
    if (!pasteText.trim()) {
      setErrorMsg('붙여넣을 텍스트를 입력해주세요.');
      return;
    }
    setErrorMsg(null);
    const res = parseCsvText(pasteText);
    setParseResult(res);
  };

  const handleLoadSample = () => {
    setErrorMsg(null);
    setFileName('dr01_reagent_inventory.csv (기본 80행)');
    const res = parseCsvText(DEFAULT_CSV_TEXT);
    setParseResult(res);
  };

  const handleConfirm = () => {
    if (parseResult && parseResult.records.length > 0) {
      onImportComplete(parseResult.records);
      onClose();
    }
  };

  return (
    <div
      id="modal-import-data"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              <span>재고대장 데이터 반입 (S-01)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              CSV, Excel(XLSX) 파일 또는 클립보드 텍스트를 반입하여 유효기간·잔량을 자동 판정합니다.
            </p>
          </div>
          <button
            id="btn-close-import"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-5 bg-slate-50/50">
          <button
            id="tab-import-upload"
            onClick={() => {
              setActiveTab('upload');
              setParseResult(null);
            }}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'upload'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            파일 업로드 (CSV / XLSX)
          </button>
          <button
            id="tab-import-paste"
            onClick={() => {
              setActiveTab('paste');
              setParseResult(null);
            }}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'paste'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            텍스트 직접 붙여넣기
          </button>
          <button
            id="tab-import-preset"
            onClick={() => {
              setActiveTab('preset');
              handleLoadSample();
            }}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-1 ${
              activeTab === 'preset'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            기본 예제 데이터 (80건)
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Tab 1: File Upload */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  dragOver
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-slate-300 hover:border-blue-400 bg-slate-50/50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                  accept=".csv,.xlsx,.xls,.tsv,.txt"
                  className="hidden"
                />
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">
                  {fileName ? fileName : 'CSV 또는 XLSX 파일을 여기에 드래그하세요'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  또는 클릭하여 컴퓨터에서 파일 선택 (최대 1,000행)
                </p>
              </div>

              {/* Encoding Option */}
              <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                <span>파일 인코딩 형식:</span>
                <select
                  value={encoding}
                  onChange={(e) => setEncoding(e.target.value as any)}
                  className="bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                >
                  <option value="utf-8">UTF-8 / UTF-8 BOM (권장)</option>
                  <option value="cp949">CP949 / EUC-KR (한국어 엑셀 CSV)</option>
                </select>
              </div>
            </div>
          )}

          {/* Tab 2: Paste Text */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <textarea
                id="textarea-paste-csv"
                rows={7}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="엑셀에서 복사한 표 데이터나 CSV 텍스트를 여기에 붙여넣으세요..."
                className="w-full p-3 font-mono text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
              <div className="flex justify-end">
                <button
                  id="btn-parse-paste"
                  onClick={handlePasteParse}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md cursor-pointer"
                >
                  데이터 파싱 및 미리보기
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Preset Sample */}
          {activeTab === 'preset' && (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs space-y-2">
              <p className="font-bold text-slate-800">
                실습용 표준 대장: <code className="text-blue-700">dr01_reagent_inventory.csv</code> (80행)
              </p>
              <p className="text-slate-600">
                유효기간 임박, 잔량 부족, 당일 만료(D=0), 초과 잔량(데이터 오류), 동일 CAS 명칭 상이(중복 후보)가 포함된 검증용 표준 데이터셋입니다.
              </p>
            </div>
          )}

          {/* Error display */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Parse Result Summary Preview */}
          {parseResult && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  파싱 완료 요약
                </span>
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  총 {parseResult.totalRows}행 파싱됨
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 text-[11px] block">유효 행수</span>
                  <span className="font-bold text-slate-900">{parseResult.validRows}건</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 text-[11px] block">결측 포함 행</span>
                  <span className="font-bold text-amber-700">{parseResult.missingDataRows}건</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 text-[11px] block">구분자 감지</span>
                  <span className="font-mono font-bold text-slate-700">
                    {parseResult.detectedDelimiter === '\t' ? 'TAB (탭)' : '쉼표 (,)'}
                  </span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 text-[11px] block">헤더 컬럼수</span>
                  <span className="font-bold text-slate-900">{parseResult.headers.length}개</span>
                </div>
              </div>

              {parseResult.warnings.length > 0 && (
                <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 space-y-1">
                  {parseResult.warnings.map((w, idx) => (
                    <p key={idx}>※ {w}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3.5 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 rounded cursor-pointer"
          >
            취소
          </button>
          <button
            id="btn-confirm-import"
            disabled={!parseResult || parseResult.records.length === 0}
            onClick={handleConfirm}
            className={`px-5 py-1.5 text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
              parseResult && parseResult.records.length > 0
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>재고대장 적용하기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
