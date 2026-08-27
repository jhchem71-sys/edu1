import React, { useState, useEffect } from 'react';
import { EvaluatedReagentRecord, RawReagentRecord, DuplicateGroupInfo } from '../types';
import { HazardBadge, StorageTempBadge, ExpiryBadge } from './Badges';
import { ResearcherMemoBox } from './ResearcherMemoBox';
import { BASE_DATE } from '../utils/evaluation';
import {
  X,
  Calculator,
  Layers,
  Save,
  Trash2,
  Calendar,
  AlertTriangle,
  FileText,
  Info,
  CheckCircle2,
  MapPin,
  User,
  ExternalLink
} from 'lucide-react';

interface ReagentDetailModalProps {
  record: EvaluatedReagentRecord | null;
  duplicateGroup?: DuplicateGroupInfo;
  onClose: () => void;
  onSave: (updated: RawReagentRecord) => void;
  onDelete: (reagentId: string) => void;
}

export const ReagentDetailModal: React.FC<ReagentDetailModalProps> = ({
  record,
  duplicateGroup,
  onClose,
  onSave,
  onDelete
}) => {
  if (!record) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<RawReagentRecord>({
    reagent_id: record.reagent_id,
    reagent_name: record.reagent_name,
    cas_no: record.cas_no,
    hazard_class: record.hazard_class,
    storage_temp: record.storage_temp,
    location: record.location,
    init_qty: record.init_qty,
    remain_qty: record.remain_qty,
    qty_unit: record.qty_unit,
    receipt_date: record.receipt_date,
    expiry_date: record.expiry_date,
    emp_name: record.emp_name,
    remark: record.remark || ''
  });

  useEffect(() => {
    setFormData({
      reagent_id: record.reagent_id,
      reagent_name: record.reagent_name,
      cas_no: record.cas_no,
      hazard_class: record.hazard_class,
      storage_temp: record.storage_temp,
      location: record.location,
      init_qty: record.init_qty,
      remain_qty: record.remain_qty,
      qty_unit: record.qty_unit,
      receipt_date: record.receipt_date,
      expiry_date: record.expiry_date,
      emp_name: record.emp_name,
      remark: record.remark || ''
    });
    setIsEditing(false);
  }, [record]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsEditing(false);
  };

  return (
    <div
      id="modal-reagent-detail"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold text-slate-800 bg-white border border-slate-300 px-2 py-0.5 rounded">
              {record.reagent_id}
            </span>
            <h2 className="text-base font-bold text-slate-900 truncate">
              {record.reagent_name}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                id="btn-edit-mode"
                onClick={() => setIsEditing(true)}
                className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded cursor-pointer transition-colors"
              >
                수정
              </button>
            ) : (
              <button
                id="btn-cancel-edit"
                onClick={() => setIsEditing(false)}
                className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
              >
                취소
              </button>
            )}
            <button
              id="btn-close-detail"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Quick Badges Bar */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <HazardBadge hazard={record.hazard_class} />
            <StorageTempBadge temp={record.storage_temp} />
            <ExpiryBadge
              expiryState={record.expiry_state}
              dDayLabel={record.dDayLabel}
              expiryDate={record.expiry_date}
            />
            {record.is_duplicate_candidate && (
              <span className="text-xs font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded border border-purple-300">
                중복 등록 후보 (동일 CAS)
              </span>
            )}
            {record.is_date_reversed && (
              <span className="text-xs font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded border border-rose-300">
                입고일자 역전 (입고일 &gt; 유효기간)
              </span>
            )}
          </div>

          {/* Business Logic Proof & Calculation Card */}
          <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-lg space-y-2">
            <h3 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-blue-700" />
              <span>판정 근거 및 계산 상세 (기준일: {BASE_DATE})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* D-Day calculation */}
              <div className="bg-white p-2.5 rounded border border-blue-100 space-y-1">
                <span className="font-semibold text-slate-700">1. 유효기간 D-day 산출식</span>
                <p className="font-mono text-slate-800 text-[11px]">
                  D = {record.expiry_date ? `${record.expiry_date} − ${BASE_DATE}` : '공란 (미기재)'}
                </p>
                <p className="text-[11px] text-blue-800 font-semibold">
                  결과: {record.dDay !== null ? `${record.dDay}일 차 (${record.dDayLabel}) → [${record.expiry_state}]` : '유효기간 미기재'}
                </p>
                <p className="text-[10px] text-slate-500">
                  ※ D ≤ 0: 만료, 0 &lt; D ≤ 30: 임박, D &gt; 30: 정상
                </p>
              </div>

              {/* Remaining rate calculation */}
              <div className="bg-white p-2.5 rounded border border-blue-100 space-y-1">
                <span className="font-semibold text-slate-700">2. 잔량률 산출식</span>
                <p className="font-mono text-slate-800 text-[11px]">
                  잔량률 = {record.remain_qty !== null ? `${record.remain_qty} ÷ ${record.init_qty} × 100` : '잔량 공란'}
                </p>
                <p className="text-[11px] text-blue-800 font-semibold">
                  결과: {record.remain_rate !== null ? `${record.remain_rate_display} → [${record.qty_state}]` : '잔량 미기재'}
                </p>
                <p className="text-[10px] text-slate-500">
                  ※ &gt;100%: 데이터 오류, 0~20%: 부족, 20~100%: 정상
                </p>
              </div>
            </div>
          </div>

          {/* Duplicate Group Inspector (if duplicate candidate) */}
          {duplicateGroup && (
            <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-purple-700" />
                  <span>동일 CAS [{duplicateGroup.cas_no}] 중복 등록 후보 분석</span>
                </h3>
                <span className="text-[11px] font-bold text-purple-800 bg-purple-200 px-2 py-0.5 rounded">
                  총 {duplicateGroup.recordsCount}건 등록
                </span>
              </div>
              <p className="text-xs text-purple-800 leading-relaxed">
                동일한 물질 식별번호(CAS No)에 <strong>{duplicateGroup.names.length}가지 상이한 명칭</strong>이 사용되어 재고 집계 분리 위험이 있습니다.
              </p>

              {/* Names list */}
              <div className="bg-white p-2.5 rounded border border-purple-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block">등록된 명칭 목록:</span>
                <ul className="divide-y divide-slate-100 text-xs">
                  {duplicateGroup.names.map((name, idx) => {
                    const matchCount = duplicateGroup.records.filter((r) => r.reagent_name === name).length;
                    return (
                      <li key={idx} className="py-1 flex items-center justify-between">
                        <span className="font-mono text-slate-900 font-semibold">{name}</span>
                        <span className="text-slate-500 text-[11px]">{matchCount}건</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Total Stock for this CAS */}
              <div className="text-xs text-purple-950 font-medium bg-purple-100/70 p-2 rounded flex items-center justify-between">
                <span>CAS [{duplicateGroup.cas_no}] 물질 전체 합산 잔량:</span>
                <span className="font-mono font-bold">
                  {Object.entries(duplicateGroup.totalRemainByUnit)
                    .map(([unit, total]) => `${(total as number).toFixed(1)} ${unit}`)
                    .join(' + ')}
                </span>
              </div>
            </div>
          )}

          {/* Form or Read-only Display */}
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-800">시약 정보 수정</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">시약 ID</label>
                  <input
                    type="text"
                    required
                    value={formData.reagent_id}
                    onChange={(e) => setFormData({ ...formData, reagent_id: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">시약명</label>
                  <input
                    type="text"
                    required
                    value={formData.reagent_name}
                    onChange={(e) => setFormData({ ...formData, reagent_name: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CAS 번호</label>
                  <input
                    type="text"
                    required
                    value={formData.cas_no}
                    onChange={(e) => setFormData({ ...formData, cas_no: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">보관 위치</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-mono"
                    placeholder="예: LAB-1 A-01"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">위험물 등급</label>
                  <select
                    value={formData.hazard_class}
                    onChange={(e) => setFormData({ ...formData, hazard_class: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  >
                    <option value="인화성">인화성</option>
                    <option value="독성">독성</option>
                    <option value="부식성">부식성</option>
                    <option value="산화성">산화성</option>
                    <option value="해당없음">해당없음</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">보관 조건</label>
                  <select
                    value={formData.storage_temp}
                    onChange={(e) => setFormData({ ...formData, storage_temp: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  >
                    <option value="RT">RT (상온)</option>
                    <option value="4℃">4℃ (냉장)</option>
                    <option value="-20℃">-20℃ (냉동)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">초기 입고량</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.init_qty ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        init_qty: e.target.value ? parseFloat(e.target.value) : null
                      })
                    }
                    className="w-full p-2 border border-slate-300 rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">현재 잔량 (공란 가능)</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.remain_qty ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        remain_qty: e.target.value ? parseFloat(e.target.value) : null
                      })
                    }
                    className="w-full p-2 border border-slate-300 rounded font-mono"
                    placeholder="공란 시 결측치"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">수량 단위</label>
                  <input
                    type="text"
                    value={formData.qty_unit}
                    onChange={(e) => setFormData({ ...formData, qty_unit: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                    placeholder="g, mL, kg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">관리 담당자</label>
                  <input
                    type="text"
                    required
                    value={formData.emp_name}
                    onChange={(e) => setFormData({ ...formData, emp_name: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">입고 일자</label>
                  <input
                    type="date"
                    required
                    value={formData.receipt_date}
                    onChange={(e) => setFormData({ ...formData, receipt_date: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">유효기간 (공란 가능)</label>
                  <input
                    type="date"
                    value={formData.expiry_date ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expiry_date: e.target.value || null
                      })
                    }
                    className="w-full p-2 border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">비고 (Remark)</label>
                <input
                  type="text"
                  value={formData.remark ?? ''}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  className="w-full p-2 text-xs border border-slate-300 rounded"
                  placeholder="예: 소분 용기 사용, 밀폐 보관, 차광 보관 등"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  저장하기
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">상세 컬럼 정보</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded">
                  <span className="text-slate-500 text-[11px] block">보관 위치</span>
                  <span className="font-mono font-bold text-slate-800">{record.location}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded">
                  <span className="text-slate-500 text-[11px] block">관리 담당자</span>
                  <span className="font-semibold text-slate-800">{record.emp_name}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded">
                  <span className="text-slate-500 text-[11px] block">입고 일자</span>
                  <span className="font-mono font-medium text-slate-800">{record.receipt_date}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded">
                  <span className="text-slate-500 text-[11px] block">유효기간</span>
                  <span className="font-mono font-bold text-slate-800">
                    {record.expiry_date || <span className="text-slate-400 font-normal">미기재</span>}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded">
                  <span className="text-slate-500 text-[11px] block">초기 입고량</span>
                  <span className="font-mono font-bold text-slate-800">
                    {record.init_qty} {record.qty_unit}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded">
                  <span className="text-slate-500 text-[11px] block">현재 잔량</span>
                  <span className="font-mono font-bold text-slate-800">
                    {record.remain_qty !== null ? `${record.remain_qty} ${record.qty_unit}` : <span className="text-slate-400 font-normal">미기재</span>}
                  </span>
                </div>
              </div>

              {record.remark && (
                <div className="bg-slate-50 p-2.5 rounded text-xs">
                  <span className="text-slate-500 text-[11px] block mb-0.5">비고 사항</span>
                  <span className="text-slate-800">{record.remark}</span>
                </div>
              )}

              {/* Researcher Personal Memo Box (Supabase RLS protected) */}
              <ResearcherMemoBox reagentId={record.reagent_id} />

              {/* Bottom deletion button */}
              <div className="pt-3 flex justify-between items-center border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`[${record.reagent_id}] ${record.reagent_name} 시약 항목을 완전히 삭제하시겠습니까?`)) {
                      onDelete(record.reagent_id);
                      onClose();
                    }
                  }}
                  className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  항목 삭제
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
                >
                  닫기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
