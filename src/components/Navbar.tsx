import React from 'react';
import {
  FlaskConical,
  Upload,
  Plus,
  Copy,
  Download,
  RotateCcw,
  Sparkles,
  Calendar,
  Layers
} from 'lucide-react';

interface NavbarProps {
  baseDate: string;
  totalCount: number;
  orderCandidatesCount: number;
  onOpenImport: () => void;
  onOpenAddModal: () => void;
  onCopyOrderList: () => void;
  onExportCsv: () => void;
  onResetToDefault: () => void;
  onOpenDuplicateModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  baseDate,
  totalCount,
  orderCandidatesCount,
  onOpenImport,
  onOpenAddModal,
  onCopyOrderList,
  onExportCsv,
  onResetToDefault,
  onOpenDuplicateModal
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white shadow-inner flex items-center justify-center">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-white">
                시약·시료 재고 관리대장
              </h1>
              <span className="text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800 px-1.5 py-0.2 rounded">
                PRD-R02
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              유효기간 임박 · 잔량 부족 · 데이터 오류 · 중복 등록 후보 자동 판정
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Order Candidates Copy Button (F-08) */}
          <button
            id="btn-copy-orders"
            onClick={onCopyOrderList}
            className="px-2.5 py-1.5 text-xs font-bold text-amber-200 bg-amber-950/80 hover:bg-amber-900 border border-amber-700/80 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
            title="만료·임박·부족 항목을 탭 구분 텍스트로 복사합니다"
          >
            <Copy className="w-3.5 h-3.5 text-amber-400" />
            <span>발주 후보 복사</span>
            <span className="bg-amber-800 text-amber-100 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {orderCandidatesCount}건
            </span>
          </button>

          {/* Import CSV/XLSX */}
          <button
            id="btn-nav-import"
            onClick={onOpenImport}
            className="px-2.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>대장 반입 (CSV/XLSX)</span>
          </button>

          {/* New Reagent */}
          <button
            id="btn-nav-add"
            onClick={onOpenAddModal}
            className="px-2.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-md flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>시약 등록</span>
          </button>

          {/* Export CSV */}
          <button
            id="btn-nav-export"
            onClick={onExportCsv}
            className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md cursor-pointer transition-colors"
            title="CSV 파일 다운로드"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Reset sample */}
          <button
            id="btn-nav-reset"
            onClick={() => {
              if (window.confirm('기본 실습 데이터(80행)로 대장을 초기화하시겠습니까?')) {
                onResetToDefault();
              }
            }}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-700 border border-slate-700 rounded-md cursor-pointer transition-colors"
            title="기본 80행 데이터셋으로 복원"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
