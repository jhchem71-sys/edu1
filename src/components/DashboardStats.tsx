import React from 'react';
import { SummaryStats, WarningFilterType } from '../types';
import {
  AlertOctagon,
  AlertTriangle,
  Flame,
  Layers,
  FileQuestion,
  TrendingDown,
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';

interface DashboardStatsProps {
  stats: SummaryStats;
  activeFilter: WarningFilterType;
  onSelectFilter: (filter: WarningFilterType) => void;
  onOpenDuplicateModal: () => void;
  baseDate: string;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  activeFilter,
  onSelectFilter,
  onOpenDuplicateModal,
  baseDate
}) => {
  const cards = [
    {
      id: 'stat-expired',
      type: '만료' as WarningFilterType,
      label: '유효기간 만료',
      sublabel: 'D ≤ 0 (당일 포함)',
      count: stats.expiredCount,
      icon: AlertOctagon,
      bgActive: 'bg-rose-50 border-rose-500 ring-2 ring-rose-400',
      bgNormal: 'bg-white border-slate-200 hover:border-rose-300',
      textColor: 'text-rose-700',
      badgeBg: 'bg-rose-100 text-rose-800',
      desc: '폐기 또는 즉시 격리 필요'
    },
    {
      id: 'stat-impending',
      type: '임박' as WarningFilterType,
      label: '유효기간 임박',
      sublabel: '1일 ~ 30일 이내',
      count: stats.impendingCount,
      icon: AlertTriangle,
      bgActive: 'bg-amber-50 border-amber-500 ring-2 ring-amber-400',
      bgNormal: 'bg-white border-slate-200 hover:border-amber-300',
      textColor: 'text-amber-700',
      badgeBg: 'bg-amber-100 text-amber-900',
      desc: '우선 소진 또는 발주 검토'
    },
    {
      id: 'stat-shortage',
      type: '부족' as WarningFilterType,
      label: '잔량 부족',
      sublabel: '잔량률 ≤ 20%',
      count: stats.shortageCount,
      icon: TrendingDown,
      bgActive: 'bg-amber-50 border-amber-500 ring-2 ring-amber-400',
      bgNormal: 'bg-white border-slate-200 hover:border-amber-300',
      textColor: 'text-amber-800',
      badgeBg: 'bg-amber-100 text-amber-900',
      desc: '실험 전 추가 발주 필요'
    },
    {
      id: 'stat-error',
      type: '데이터 오류' as WarningFilterType,
      label: '데이터 오류',
      sublabel: '잔량 > 초기량 등',
      count: stats.dataErrorCount,
      icon: AlertTriangle,
      bgActive: 'bg-red-50 border-red-500 ring-2 ring-red-400',
      bgNormal: 'bg-white border-slate-200 hover:border-red-300',
      textColor: 'text-red-700',
      badgeBg: 'bg-red-100 text-red-800',
      desc: '입고/잔량 오기 정정 대상'
    },
    {
      id: 'stat-duplicate',
      type: '중복 후보' as WarningFilterType,
      label: '중복 등록 후보',
      sublabel: '동일 CAS · 명칭 상이',
      count: stats.duplicateGroupCount,
      unit: '개 그룹',
      icon: Layers,
      bgActive: 'bg-purple-50 border-purple-500 ring-2 ring-purple-400',
      bgNormal: 'bg-white border-slate-200 hover:border-purple-300',
      textColor: 'text-purple-700',
      badgeBg: 'bg-purple-100 text-purple-800',
      desc: '표기 흔들림 물질 통합 검토',
      hasSpecialAction: true
    },
    {
      id: 'stat-missing',
      type: '결측' as WarningFilterType,
      label: '결측 행',
      sublabel: '유효기간 또는 잔량 공란',
      count: stats.missingDataCount,
      unit: '건',
      icon: FileQuestion,
      bgActive: 'bg-slate-100 border-slate-500 ring-2 ring-slate-400',
      bgNormal: 'bg-white border-slate-200 hover:border-slate-300',
      textColor: 'text-slate-700',
      badgeBg: 'bg-slate-100 text-slate-700',
      desc: '현장 확인 및 보완 대상'
    }
  ];

  return (
    <section id="dashboard-summary-section" className="space-y-3">
      {/* Header Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
            <span>판정 경고 요약 대시보드</span>
          </h2>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium border border-slate-200">
            총 {stats.totalCount}건 등록
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-mono">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>기준일(D-day): <strong>{baseDate}</strong> (KST)</span>
          </div>
          {activeFilter !== 'ALL' && (
            <button
              id="btn-clear-stat-filter"
              onClick={() => onSelectFilter('ALL')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline underline-offset-2 cursor-pointer"
            >
              필터 해제 (전체보기)
            </button>
          )}
        </div>
      </div>

      {/* 6 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {cards.map((card) => {
          const Icon = card.icon;
          const isActive = activeFilter === card.type;

          return (
            <div
              key={card.type}
              id={card.id}
              onClick={() => onSelectFilter(isActive ? 'ALL' : card.type)}
              className={`p-3 rounded-lg border transition-all cursor-pointer select-none relative group ${
                isActive ? card.bgActive : card.bgNormal
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`p-1.5 rounded-md ${card.badgeBg}`}>
                  <Icon className="w-4 h-4" />
                </span>
                {isActive && (
                  <span className="text-[10px] font-bold bg-slate-900 text-white px-1.5 py-0.2 rounded-full">
                    선택됨
                  </span>
                )}
              </div>

              <div className="mt-1">
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-bold font-mono tracking-tight ${card.textColor}`}>
                    {card.count}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{card.unit || '건'}</span>
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5 leading-tight">
                  {card.label}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                  {card.sublabel}
                </div>
              </div>

              {card.hasSpecialAction && card.count > 0 && (
                <button
                  id="btn-open-duplicate-modal"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDuplicateModal();
                  }}
                  className="mt-2 w-full text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 py-1 px-1.5 rounded flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  <span>상세 비교 보기</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
