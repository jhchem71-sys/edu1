import React from 'react';
import { EvaluatedReagentRecord } from '../types';
import { HazardBadge, StorageTempBadge, ExpiryBadge, QtyProgress } from './Badges';
import {
  AlertCircle,
  Eye,
  Trash2,
  Layers,
  Clock,
  RotateCcw,
  Sparkles,
  MapPin,
  User,
  AlertTriangle
} from 'lucide-react';

interface ReagentListProps {
  records: EvaluatedReagentRecord[];
  viewMode: 'table' | 'cards';
  onSelectRecord: (record: EvaluatedReagentRecord) => void;
  onDeleteRecord: (reagentId: string) => void;
  onResetFilter: () => void;
  onOpenDuplicateModalForCas?: (cas: string) => void;
}

export const ReagentList: React.FC<ReagentListProps> = ({
  records,
  viewMode,
  onSelectRecord,
  onDeleteRecord,
  onResetFilter,
  onOpenDuplicateModalForCas
}) => {
  if (records.length === 0) {
    return (
      <div
        id="empty-results-state"
        className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-3"
      >
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-800">조건에 해당하는 시약이 없습니다</h3>
          <p className="text-xs text-slate-500">
            검색어나 필터 조건을 변경하거나 초기화해 보세요.
          </p>
        </div>
        <button
          id="btn-empty-reset"
          onClick={onResetFilter}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>필터 초기화</span>
        </button>
      </div>
    );
  }

  if (viewMode === 'cards') {
    return (
      <div id="reagent-cards-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {records.map((record) => {
          const isWarningRow =
            record.expiry_state === '만료' ||
            record.qty_state === '데이터 오류' ||
            record.qty_state === '부족';

          return (
            <div
              key={record.reagent_id}
              id={`card-${record.reagent_id}`}
              onClick={() => onSelectRecord(record)}
              className={`bg-white border rounded-lg p-3.5 transition-all hover:shadow-md cursor-pointer space-y-3 relative group ${
                record.expiry_state === '만료'
                  ? 'border-rose-300 bg-rose-50/20'
                  : record.qty_state === '데이터 오류'
                  ? 'border-rose-300 bg-rose-50/20'
                  : record.qty_state === '부족'
                  ? 'border-amber-300 bg-amber-50/20'
                  : record.expiry_state === '임박'
                  ? 'border-amber-300 bg-amber-50/10'
                  : 'border-slate-200'
              }`}
            >
              {/* Card Header: ID, Badges, Name */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                      {record.reagent_id}
                    </span>
                    <HazardBadge hazard={record.hazard_class} />
                    <StorageTempBadge temp={record.storage_temp} />
                  </div>
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                      {record.reagent_name}
                    </h3>
                    {record.is_duplicate_candidate && (
                      <span
                        id={`badge-dup-${record.reagent_id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenDuplicateModalForCas && record.cas_no) {
                            onOpenDuplicateModalForCas(record.cas_no);
                          }
                        }}
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300 rounded cursor-pointer hover:bg-purple-200"
                        title="동일 CAS 번호에 다른 표기 명칭이 존재합니다 (클릭하여 비교)"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-purple-600" />
                        중복?
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-xs text-slate-500">CAS: {record.cas_no}</span>
                </div>

                <div className="shrink-0 text-right">
                  <ExpiryBadge
                    expiryState={record.expiry_state}
                    dDayLabel={record.dDayLabel}
                    expiryDate={record.expiry_date}
                  />
                </div>
              </div>

              {/* Progress and Stock */}
              <div className="pt-2 border-t border-slate-100">
                <QtyProgress
                  qtyState={record.qty_state}
                  remainRate={record.remain_rate}
                  remainRateDisplay={record.remain_rate_display}
                  initQty={record.init_qty}
                  remainQty={record.remain_qty}
                  qtyUnit={record.qty_unit}
                />
              </div>

              {/* Location, Manager, Date Reversed Warning */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 font-mono font-medium text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {record.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    {record.emp_name}
                  </span>
                </div>

                {record.is_date_reversed && (
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <AlertTriangle className="w-3 h-3" />
                    일자 역전
                  </span>
                )}
              </div>

              {record.remark && (
                <div className="text-[11px] text-slate-500 italic truncate bg-slate-50 p-1.5 rounded border border-slate-100">
                  {record.remark}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Desktop/Default Table View
  return (
    <div id="reagent-table-container" className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-2.5 px-3 w-16">ID</th>
              <th className="py-2.5 px-3 min-w-[170px]">시약명 / CAS</th>
              <th className="py-2.5 px-3 w-28">위험물 / 보관</th>
              <th className="py-2.5 px-3 w-28">위치 / 담당자</th>
              <th className="py-2.5 px-3 w-36">유효기간 (D-Day)</th>
              <th className="py-2.5 px-3 min-w-[180px]">재고 잔량 / 비율</th>
              <th className="py-2.5 px-3 min-w-[110px]">비고</th>
              <th className="py-2.5 px-3 w-20 text-center">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((record) => {
              return (
                <tr
                  key={record.reagent_id}
                  id={`row-${record.reagent_id}`}
                  onClick={() => onSelectRecord(record)}
                  className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                    record.expiry_state === '만료'
                      ? 'bg-rose-50/20'
                      : record.qty_state === '데이터 오류'
                      ? 'bg-rose-50/20'
                      : record.qty_state === '부족'
                      ? 'bg-amber-50/20'
                      : ''
                  }`}
                >
                  {/* ID */}
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                    {record.reagent_id}
                  </td>

                  {/* Name & CAS */}
                  <td className="py-2.5 px-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-900 text-xs">
                          {record.reagent_name}
                        </span>
                        {record.is_duplicate_candidate && (
                          <span
                            id={`tag-dup-${record.reagent_id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onOpenDuplicateModalForCas && record.cas_no) {
                                onOpenDuplicateModalForCas(record.cas_no);
                              }
                            }}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 rounded cursor-pointer hover:bg-purple-200"
                            title="동일 CAS 번호에 상이한 명칭 존재 (클릭하여 그룹 확인)"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-purple-600" />
                            중복?
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[11px] text-slate-500">
                        {record.cas_no}
                      </div>
                    </div>
                  </td>

                  {/* Hazard & Temp */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="flex flex-col gap-1 items-start">
                      <HazardBadge hazard={record.hazard_class} />
                      <StorageTempBadge temp={record.storage_temp} />
                    </div>
                  </td>

                  {/* Location & Emp */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="space-y-0.5">
                      <div className="font-mono font-medium text-slate-800">
                        {record.location}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {record.emp_name}
                      </div>
                    </div>
                  </td>

                  {/* Expiry & D-day */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <ExpiryBadge
                      expiryState={record.expiry_state}
                      dDayLabel={record.dDayLabel}
                      expiryDate={record.expiry_date}
                    />
                    {record.is_date_reversed && (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1 py-0.2 rounded inline-block mt-0.5">
                        일자역전
                      </span>
                    )}
                  </td>

                  {/* Remain Qty Progress Bar */}
                  <td className="py-2.5 px-3">
                    <QtyProgress
                      qtyState={record.qty_state}
                      remainRate={record.remain_rate}
                      remainRateDisplay={record.remain_rate_display}
                      initQty={record.init_qty}
                      remainQty={record.remain_qty}
                      qtyUnit={record.qty_unit}
                    />
                  </td>

                  {/* Remarks */}
                  <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                    <span className="line-clamp-2">{record.remark || '-'}</span>
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        id={`btn-view-${record.reagent_id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRecord(record);
                        }}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                        title="상세정보 및 수정"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`btn-del-${record.reagent_id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`[${record.reagent_id}] ${record.reagent_name} 항목을 삭제하시겠습니까?`)) {
                            onDeleteRecord(record.reagent_id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        title="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
