import React from 'react';
import { HazardClass, StorageTemp, ExpiryState, QtyState } from '../types';
import { AlertTriangle, Flame, Skull, Zap, Shield, Snowflake, Thermometer, HelpCircle } from 'lucide-react';

interface HazardBadgeProps {
  hazard: HazardClass;
  className?: string;
}

export const HazardBadge: React.FC<HazardBadgeProps> = ({ hazard, className = '' }) => {
  switch (hazard) {
    case '인화성':
      return (
        <span
          id={`badge-hazard-${hazard}`}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700 border border-red-200 ${className}`}
          title="인화성 물질 (화기 엄금)"
        >
          <Flame className="w-3 h-3 text-red-600 shrink-0" />
          인화성
        </span>
      );
    case '독성':
      return (
        <span
          id={`badge-hazard-${hazard}`}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200 ${className}`}
          title="독성 물질 (흡입·접촉 주의)"
        >
          <Skull className="w-3 h-3 text-fuchsia-700 shrink-0" />
          독성
        </span>
      );
    case '부식성':
      return (
        <span
          id={`badge-hazard-${hazard}`}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 ${className}`}
          title="부식성 물질 (보호구 착용)"
        >
          <Zap className="w-3 h-3 text-amber-700 shrink-0" />
          부식성
        </span>
      );
    case '산화성':
      return (
        <span
          id={`badge-hazard-${hazard}`}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 ${className}`}
          title="산화성 물질 (가연물 접촉 금지)"
        >
          <Shield className="w-3 h-3 text-blue-700 shrink-0" />
          산화성
        </span>
      );
    case '해당없음':
      return (
        <span
          id="badge-hazard-none"
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 ${className}`}
        >
          해당없음
        </span>
      );
    default:
      return (
        <span
          id="badge-hazard-unclassified"
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-300 ${className}`}
          title={`미분류: ${hazard}`}
        >
          <HelpCircle className="w-3 h-3 text-slate-500 shrink-0" />
          미분류 ({hazard || '미기재'})
        </span>
      );
  }
};

interface StorageTempBadgeProps {
  temp: StorageTemp;
  className?: string;
}

export const StorageTempBadge: React.FC<StorageTempBadgeProps> = ({ temp, className = '' }) => {
  switch (temp) {
    case '-20℃':
      return (
        <span
          id="badge-temp-minus20"
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-900 border border-indigo-300 ${className}`}
          title="냉동 보관 (-20℃)"
        >
          <Snowflake className="w-3 h-3 text-indigo-700 shrink-0" />
          -20℃
        </span>
      );
    case '4℃':
      return (
        <span
          id="badge-temp-4c"
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-300 ${className}`}
          title="냉장 보관 (4℃)"
        >
          <Snowflake className="w-3 h-3 text-sky-600 shrink-0" />
          4℃
        </span>
      );
    case 'RT':
      return (
        <span
          id="badge-temp-rt"
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}
          title="상온 보관 (Room Temp)"
        >
          <Thermometer className="w-3 h-3 text-slate-500 shrink-0" />
          RT (상온)
        </span>
      );
    default:
      return (
        <span
          id="badge-temp-unclassified"
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-300 ${className}`}
        >
          {temp || '미분류'}
        </span>
      );
  }
};

interface ExpiryBadgeProps {
  expiryState: ExpiryState;
  dDayLabel: string;
  expiryDate?: string | null;
  className?: string;
}

export const ExpiryBadge: React.FC<ExpiryBadgeProps> = ({
  expiryState,
  dDayLabel,
  expiryDate,
  className = ''
}) => {
  switch (expiryState) {
    case '만료':
      return (
        <div className={`inline-flex flex-col items-start ${className}`}>
          <span
            id="badge-expiry-expired"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-rose-600 text-white shadow-xs"
          >
            <AlertTriangle className="w-3 h-3 shrink-0" />
            만료 ({dDayLabel})
          </span>
          {expiryDate && <span className="text-[11px] text-rose-700 font-mono mt-0.5">{expiryDate}</span>}
        </div>
      );
    case '임박':
      return (
        <div className={`inline-flex flex-col items-start ${className}`}>
          <span
            id="badge-expiry-impending"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-amber-500 text-slate-950 shadow-xs"
          >
            <AlertTriangle className="w-3 h-3 shrink-0" />
            임박 ({dDayLabel})
          </span>
          {expiryDate && <span className="text-[11px] text-amber-800 font-mono mt-0.5">{expiryDate}</span>}
        </div>
      );
    case '정상':
      return (
        <div className={`inline-flex flex-col items-start ${className}`}>
          <span
            id="badge-expiry-normal"
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-300"
          >
            정상 ({dDayLabel})
          </span>
          {expiryDate && <span className="text-[11px] text-slate-600 font-mono mt-0.5">{expiryDate}</span>}
        </div>
      );
    default:
      return (
        <span
          id="badge-expiry-missing"
          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-600"
        >
          유효기간 미기재
        </span>
      );
  }
};

interface QtyProgressProps {
  qtyState: QtyState;
  remainRate: number | null;
  remainRateDisplay: string;
  initQty: number | null;
  remainQty: number | null;
  qtyUnit: string;
  className?: string;
}

export const QtyProgress: React.FC<QtyProgressProps> = ({
  qtyState,
  remainRate,
  remainRateDisplay,
  initQty,
  remainQty,
  qtyUnit,
  className = ''
}) => {
  if (qtyState === '잔량 미기재' || remainQty === null) {
    return (
      <div className={`space-y-1 ${className}`}>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>초기: {initQty !== null ? `${initQty} ${qtyUnit}` : '-'}</span>
          <span className="font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">잔량 미기재</span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div className="w-0 h-full bg-slate-400" />
        </div>
      </div>
    );
  }

  if (qtyState === '데이터 오류') {
    return (
      <div className={`space-y-1 ${className}`}>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-700 font-mono text-[11px]">
            {remainQty} / {initQty} {qtyUnit}
          </span>
          <span className="font-bold text-rose-700 bg-rose-100 border border-rose-300 px-1.5 py-0.5 rounded text-[11px]">
            오류 ({remainRateDisplay})
          </span>
        </div>
        <div className="w-full bg-rose-100 h-2 rounded-full overflow-hidden border border-rose-300">
          <div
            className="h-full bg-rose-600 rounded-full"
            style={{ width: '100%' }}
          />
        </div>
        <p className="text-[10px] text-rose-600 font-medium">※ 잔량이 초기 입고량 초과</p>
      </div>
    );
  }

  const clampedPercent = Math.max(0, Math.min(100, remainRate || 0));
  const isLow = qtyState === '부족';

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-700 font-mono text-[11px]">
          <span className="font-semibold text-slate-900">{remainQty}</span> / {initQty} {qtyUnit}
        </span>
        <span
          className={`font-semibold px-1.5 py-0.5 rounded text-[11px] ${
            isLow
              ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          {isLow ? `부족 ${remainRateDisplay}` : remainRateDisplay}
        </span>
      </div>
      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isLow ? 'bg-amber-500' : 'bg-emerald-600'
          }`}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
    </div>
  );
};
