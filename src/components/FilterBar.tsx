import React from 'react';
import { FilterConfig, WarningFilterType } from '../types';
import {
  Search,
  RotateCcw,
  SlidersHorizontal,
  ArrowUpDown,
  LayoutGrid,
  List,
  X
} from 'lucide-react';

interface FilterBarProps {
  filter: FilterConfig;
  onFilterChange: (newFilter: FilterConfig) => void;
  onResetFilter: () => void;
  viewMode: 'table' | 'cards';
  onToggleViewMode: (mode: 'table' | 'cards') => void;
  filteredCount: number;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onFilterChange,
  onResetFilter,
  viewMode,
  onToggleViewMode,
  filteredCount,
  totalCount
}) => {
  const isFilterActive =
    filter.search !== '' ||
    filter.warningFilter !== 'ALL' ||
    filter.hazardFilter !== 'ALL' ||
    filter.tempFilter !== 'ALL' ||
    filter.labFilter !== 'ALL' ||
    filter.sortBy !== 'warn_rank' ||
    filter.sortOrder !== 'asc';

  return (
    <div id="filter-toolbar" className="bg-white border border-slate-200 rounded-lg p-3 space-y-3 shadow-xs">
      {/* Top Search & Fast Action Line */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-reagent-search"
            type="text"
            placeholder="시약명, CAS 번호(900-XX-X), 위치(LAB-1...), 담당자 검색..."
            value={filter.search}
            onChange={(e) => onFilterChange({ ...filter, search: e.target.value })}
            className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
          {filter.search && (
            <button
              id="btn-clear-search"
              onClick={() => onFilterChange({ ...filter, search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View toggle & Reset */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200">
            <button
              id="btn-view-table"
              onClick={() => onToggleViewMode('table')}
              className={`p-1.5 rounded text-xs flex items-center gap-1 font-medium transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="표 형식 보기"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">테이블</span>
            </button>
            <button
              id="btn-view-cards"
              onClick={() => onToggleViewMode('cards')}
              className={`p-1.5 rounded text-xs flex items-center gap-1 font-medium transition-colors cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="카드 형식 보기"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">카드</span>
            </button>
          </div>

          {isFilterActive && (
            <button
              id="btn-reset-filters"
              onClick={onResetFilter}
              className="px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>초기화</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Selectors Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
        {/* Warning Category */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">경고 구분</label>
          <select
            id="select-warning-filter"
            value={filter.warningFilter}
            onChange={(e) =>
              onFilterChange({ ...filter, warningFilter: e.target.value as WarningFilterType })
            }
            className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:ring-1 focus:ring-blue-500 font-medium"
          >
            <option value="ALL">전체 상태</option>
            <option value="만료">만료 (D ≤ 0)</option>
            <option value="임박">임박 (1~30일)</option>
            <option value="부족">부족 (≤ 20%)</option>
            <option value="데이터 오류">데이터 오류</option>
            <option value="중복 후보">중복 등록 후보</option>
            <option value="결측">결측치 (공란)</option>
            <option value="정상">정상 품목</option>
          </select>
        </div>

        {/* Hazard Class */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">위험물 등급</label>
          <select
            id="select-hazard-filter"
            value={filter.hazardFilter}
            onChange={(e) => onFilterChange({ ...filter, hazardFilter: e.target.value })}
            className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:ring-1 focus:ring-blue-500 font-medium"
          >
            <option value="ALL">전체 등급</option>
            <option value="인화성">인화성</option>
            <option value="독성">독성</option>
            <option value="부식성">부식성</option>
            <option value="산화성">산화성</option>
            <option value="해당없음">해당없음</option>
          </select>
        </div>

        {/* Storage Temp */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">보관 조건</label>
          <select
            id="select-temp-filter"
            value={filter.tempFilter}
            onChange={(e) => onFilterChange({ ...filter, tempFilter: e.target.value })}
            className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:ring-1 focus:ring-blue-500 font-medium"
          >
            <option value="ALL">전체 온도</option>
            <option value="RT">RT (상온)</option>
            <option value="4℃">4℃ (냉장)</option>
            <option value="-20℃">-20℃ (냉동)</option>
          </select>
        </div>

        {/* Lab Location */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">연구실 구분</label>
          <select
            id="select-lab-filter"
            value={filter.labFilter}
            onChange={(e) => onFilterChange({ ...filter, labFilter: e.target.value })}
            className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:ring-1 focus:ring-blue-500 font-medium"
          >
            <option value="ALL">전체 연구실</option>
            <option value="LAB-1">LAB-1</option>
            <option value="LAB-2">LAB-2</option>
            <option value="LAB-3">LAB-3</option>
          </select>
        </div>

        {/* Sort Field */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">정렬 기준</label>
          <select
            id="select-sort-by"
            value={filter.sortBy}
            onChange={(e) => onFilterChange({ ...filter, sortBy: e.target.value as any })}
            className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:ring-1 focus:ring-blue-500 font-medium"
          >
            <option value="warn_rank">기본 (위험도 순)</option>
            <option value="dDay">D-Day (만료 임박순)</option>
            <option value="remain_rate">잔량률 (부족순)</option>
            <option value="reagent_id">시약 ID 순</option>
            <option value="reagent_name">시약명 가나다순</option>
            <option value="receipt_date">입고일 순</option>
            <option value="expiry_date">유효기간 순</option>
          </select>
        </div>

        {/* Sort Order Direction */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">정렬 방향</label>
          <button
            id="btn-toggle-sort-order"
            onClick={() =>
              onFilterChange({
                ...filter,
                sortOrder: filter.sortOrder === 'asc' ? 'desc' : 'asc'
              })
            }
            className="w-full p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded flex items-center justify-between font-medium text-slate-700 cursor-pointer"
          >
            <span>{filter.sortOrder === 'asc' ? '오름차순 (▲)' : '내림차순 (▼)'}</span>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Filter result count row */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
        <div>
          검색 결과:{' '}
          <strong className="text-slate-800 font-semibold">{filteredCount}</strong>건 / 전체{' '}
          {totalCount}건
        </div>
        {filter.warningFilter !== 'ALL' && (
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              필터: {filter.warningFilter}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
