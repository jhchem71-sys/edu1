import React from 'react';
import { DuplicateGroupInfo, EvaluatedReagentRecord } from '../types';
import { X, Layers, Sparkles, AlertCircle, ArrowRight, MapPin, CheckCircle2 } from 'lucide-react';
import { HazardBadge, StorageTempBadge, ExpiryBadge } from './Badges';

interface DuplicateGroupsModalProps {
  groups: DuplicateGroupInfo[];
  initialSelectedCas?: string;
  onClose: () => void;
  onSelectRecord: (record: EvaluatedReagentRecord) => void;
}

export const DuplicateGroupsModal: React.FC<DuplicateGroupsModalProps> = ({
  groups,
  initialSelectedCas,
  onClose,
  onSelectRecord
}) => {
  return (
    <div
      id="modal-duplicate-groups"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-purple-50/80 backdrop-blur-md border-b border-purple-200 px-5 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-purple-200 text-purple-900 rounded-lg">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-purple-950">
                동일 CAS 중복 등록 후보 분석 ({groups.length}개 그룹)
              </h2>
              <p className="text-xs text-purple-700">
                동일한 CAS 식별번호 내에서 시약명의 표기 차이로 인해 분리 등록된 후보 목록입니다.
              </p>
            </div>
          </div>
          <button
            id="btn-close-dup-modal"
            onClick={onClose}
            className="text-purple-600 hover:text-purple-900 p-1 rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {groups.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="font-bold text-slate-800">중복 등록 후보가 없습니다.</p>
              <p className="text-xs text-slate-500">모든 CAS 번호의 명칭 표기가 단일하게 통일되어 있습니다.</p>
            </div>
          ) : (
            groups.map((group, gIdx) => {
              const isTargeted = initialSelectedCas === group.cas_no;

              // Analysis description based on CAS
              let anomalyReason = '원문 텍스트 표기 차이 (정규화 없이 원문 비교 검출)';
              if (group.cas_no === '900-01-1') {
                anomalyReason = "괄호 부기 명칭 차이 ('MMA-X' vs 'MMA-X (안정제 함유)')";
              } else if (group.cas_no === '900-03-3') {
                anomalyReason = "유니코드 하이픈 코드포인트 차이 ('AIBN-Z' U+002D 일반 하이픈 vs 'AIBN‑Z' U+2011 비분리 하이픈)";
              }

              return (
                <div
                  key={group.cas_no}
                  id={`dup-group-${group.cas_no}`}
                  className={`border rounded-xl p-4.5 space-y-3.5 transition-all ${
                    isTargeted
                      ? 'border-purple-500 bg-purple-50/30 ring-2 ring-purple-400'
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  {/* Group header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold bg-purple-900 text-white px-2 py-0.5 rounded">
                        CAS {group.cas_no}
                      </span>
                      <span className="text-xs text-slate-600 font-medium">
                        후보 조합: <strong>{group.pairCount}쌍</strong> ({group.names.length}종 명칭 표기)
                      </span>
                    </div>
                    <div className="text-xs font-mono font-bold text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded-full">
                      물질 합산 잔량:{' '}
                      {Object.entries(group.totalRemainByUnit)
                        .map(([unit, total]) => `${(total as number).toFixed(1)} ${unit}`)
                        .join(', ')}
                    </div>
                  </div>

                  {/* Detection reason note */}
                  <div className="text-xs bg-white p-2.5 rounded-lg border border-purple-100 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-purple-900 font-semibold">검출 사유: </strong>
                      <span className="text-slate-700">{anomalyReason}</span>
                    </div>
                  </div>

                  {/* Names breakdown */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-700 block">
                      표기별 등록 현황 및 재고:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {group.names.map((name, nIdx) => {
                        const subRecords = group.records.filter((r) => r.reagent_name === name);
                        const subTotalRemain = subRecords.reduce(
                          (acc, cur) => acc + (cur.remain_qty || 0),
                          0
                        );
                        const unit = subRecords[0]?.qty_unit || 'g';

                        return (
                          <div
                            key={nIdx}
                            className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs flex items-center justify-between"
                          >
                            <div>
                              <span className="font-mono font-bold text-slate-900 block">
                                {name}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {subRecords.length}건 등록
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-bold text-slate-800">
                                {subTotalRemain.toFixed(1)} {unit}
                              </span>
                              <span className="text-[10px] text-slate-400 block">소계</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reagents Table inside group */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] font-bold text-slate-600 block">
                      해당 CAS 등록 시약 목록 (총 {group.records.length}건):
                    </span>
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs">
                      {group.records.map((item) => (
                        <div
                          key={item.reagent_id}
                          onClick={() => {
                            onClose();
                            onSelectRecord(item);
                          }}
                          className="p-2 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                              {item.reagent_id}
                            </span>
                            <span className="font-semibold text-slate-900">{item.reagent_name}</span>
                            <span className="text-slate-400 font-mono text-[11px]">
                              ({item.location})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-700 text-[11px]">
                              {item.remain_qty !== null ? `${item.remain_qty} ${item.qty_unit}` : '미기재'}
                            </span>
                            <span className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold flex items-center gap-0.5">
                              <span>상세</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
