import React, { useState } from 'react';
import { RawReagentRecord } from '../types';
import { X, Plus, Save } from 'lucide-react';

interface ReagentFormModalProps {
  onClose: () => void;
  onAdd: (newRecord: RawReagentRecord) => void;
  nextId: string;
}

export const ReagentFormModal: React.FC<ReagentFormModalProps> = ({ onClose, onAdd, nextId }) => {
  const [formData, setFormData] = useState<RawReagentRecord>({
    reagent_id: nextId,
    reagent_name: '',
    cas_no: '',
    hazard_class: '해당없음',
    storage_temp: 'RT',
    location: 'LAB-1 A-01',
    init_qty: 500,
    remain_qty: 500,
    qty_unit: 'mL',
    receipt_date: '2026-08-27',
    expiry_date: '2028-12-31',
    emp_name: '관리자',
    remark: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reagent_name.trim() || !formData.cas_no.trim()) {
      alert('시약명과 CAS 번호는 필수 입력 항목입니다.');
      return;
    }
    onAdd(formData);
    onClose();
  };

  return (
    <div
      id="modal-add-reagent"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            <span>신규 시약 등록</span>
          </h2>
          <button
            id="btn-close-add"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">시약 ID</label>
              <input
                type="text"
                required
                value={formData.reagent_id}
                onChange={(e) => setFormData({ ...formData, reagent_id: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">시약명 *</label>
              <input
                type="text"
                required
                placeholder="예: MMA-X"
                value={formData.reagent_name}
                onChange={(e) => setFormData({ ...formData, reagent_name: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">CAS 번호 *</label>
              <input
                type="text"
                required
                placeholder="예: 900-01-1"
                value={formData.cas_no}
                onChange={(e) => setFormData({ ...formData, cas_no: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">보관 위치 *</label>
              <input
                type="text"
                required
                placeholder="예: LAB-2 A-01"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded font-mono"
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
              <label className="block font-semibold text-slate-700 mb-1">초기 입고량 *</label>
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
                placeholder="비워두면 결측 처리"
                value={formData.remain_qty ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    remain_qty: e.target.value ? parseFloat(e.target.value) : null
                  })
                }
                className="w-full p-2 border border-slate-300 rounded font-mono"
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
              <label className="block font-semibold text-slate-700 mb-1">관리 담당자 *</label>
              <input
                type="text"
                required
                value={formData.emp_name}
                onChange={(e) => setFormData({ ...formData, emp_name: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">입고 일자 *</label>
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
              placeholder="예: 소분 용기 사용, 개봉 사용중 등"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-1 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              시약 등록하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
