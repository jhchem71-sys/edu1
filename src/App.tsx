import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  RawReagentRecord,
  EvaluatedReagentRecord,
  FilterConfig,
  WarningFilterType,
  DuplicateGroupInfo
} from './types';
import { DEFAULT_CSV_TEXT } from './data/defaultCsv';
import { parseCsvText, exportToCsvText } from './utils/csvParser';
import {
  BASE_DATE,
  evaluateAllRecords,
  filterAndSortRecords,
  formatOrderCandidatesTSV
} from './utils/evaluation';
import { getSupabaseClient } from './lib/supabaseClient';

import { Navbar } from './components/Navbar';
import { DashboardStats } from './components/DashboardStats';
import { FilterBar } from './components/FilterBar';
import { ReagentList } from './components/ReagentList';
import { ReagentDetailModal } from './components/ReagentDetailModal';
import { DuplicateGroupsModal } from './components/DuplicateGroupsModal';
import { ImportModal } from './components/ImportModal';
import { ReagentFormModal } from './components/ReagentFormModal';
import { LoginScreen } from './components/LoginScreen';
import { SupabaseSetupModal } from './components/SupabaseSetupModal';
import { Toast, ToastMessage } from './components/Toast';

const STORAGE_KEY = 'reagent_inventory_dataset_v1';

export default function App() {
  // Auth state
  const [user, setUser] = useState<any | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [isSupabaseSetupOpen, setIsSupabaseSetupOpen] = useState(false);

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) {
      setAuthChecking(false);
      return;
    }

    client.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setAuthChecking(false);
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setAuthChecking(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const client = getSupabaseClient();
    if (client) {
      await client.auth.signOut();
    }
    setUser(null);
    showToast('info', '로그아웃 완료', '성공적으로 로그아웃되었습니다.');
  };

  // Raw records in state & local storage
  const [rawRecords, setRawRecords] = useState<RawReagentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('LocalStorage load failed, fallback to default dataset', e);
    }
    // Default 80 items
    const parsedDefault = parseCsvText(DEFAULT_CSV_TEXT);
    return parsedDefault.records;
  });

  // Filter and view states
  const [filter, setFilter] = useState<FilterConfig>({
    search: '',
    warningFilter: 'ALL',
    hazardFilter: 'ALL',
    tempFilter: 'ALL',
    labFilter: 'ALL',
    sortBy: 'warn_rank',
    sortOrder: 'asc'
  });
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modals state
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [selectedCasForDup, setSelectedCasForDup] = useState<string | undefined>(undefined);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rawRecords));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, [rawRecords]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    setToast({ id: String(Date.now()), type, title, description });
  };

  // Evaluate all records and extract stats & duplicate groups
  const { evaluatedRecords, duplicateGroups, stats } = useMemo(() => {
    return evaluateAllRecords(rawRecords);
  }, [rawRecords]);

  // Filtered and sorted records
  const displayRecords = useMemo(() => {
    return filterAndSortRecords(evaluatedRecords, filter);
  }, [evaluatedRecords, filter]);

  // Selected record object
  const selectedRecord = useMemo(() => {
    if (!selectedRecordId) return null;
    return evaluatedRecords.find((r) => r.reagent_id === selectedRecordId) || null;
  }, [selectedRecordId, evaluatedRecords]);

  // Selected record's duplicate group if any
  const selectedRecordDupGroup = useMemo(() => {
    if (!selectedRecord || !selectedRecord.cas_no) return undefined;
    return duplicateGroups.find((g) => g.cas_no === selectedRecord.cas_no);
  }, [selectedRecord, duplicateGroups]);

  // Order candidates count (만료 + 임박 + 부족)
  const orderCandidatesCount = useMemo(() => {
    return evaluatedRecords.filter(
      (r) => r.expiry_state === '만료' || r.expiry_state === '임박' || r.qty_state === '부족'
    ).length;
  }, [evaluatedRecords]);

  // Next available Reagent ID for addition
  const nextReagentId = useMemo(() => {
    const numbers = rawRecords
      .map((r) => {
        const m = r.reagent_id.match(/\d+/);
        return m ? parseInt(m[0], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
    return `RG-${String(maxNum + 1).padStart(3, '0')}`;
  }, [rawRecords]);

  // Handler: Select record for detail modal
  const handleSelectRecord = useCallback((record: EvaluatedReagentRecord) => {
    setSelectedRecordId(record.reagent_id);
  }, []);

  // Handler: Add reagent
  const handleAddRecord = useCallback(
    (newRec: RawReagentRecord) => {
      setRawRecords((prev) => [newRec, ...prev]);
      showToast('success', '시약 등록 완료', `[${newRec.reagent_id}] ${newRec.reagent_name} 항목이 등록되었습니다.`);
    },
    []
  );

  // Handler: Update reagent
  const handleUpdateRecord = useCallback(
    (updated: RawReagentRecord) => {
      setRawRecords((prev) =>
        prev.map((item) => (item.reagent_id === updated.reagent_id ? updated : item))
      );
      showToast('success', '시약 정보 수정 완료', `[${updated.reagent_id}] ${updated.reagent_name} 정보가 갱신되었습니다.`);
    },
    []
  );

  // Handler: Delete reagent
  const handleDeleteRecord = useCallback(
    (reagentId: string) => {
      setRawRecords((prev) => prev.filter((item) => item.reagent_id !== reagentId));
      if (selectedRecordId === reagentId) {
        setSelectedRecordId(null);
      }
      showToast('info', '시약 삭제 완료', `[${reagentId}] 시약 항목이 삭제되었습니다.`);
    },
    [selectedRecordId]
  );

  // Handler: Reset to default 80 rows
  const handleResetToDefault = useCallback(() => {
    const parsed = parseCsvText(DEFAULT_CSV_TEXT);
    setRawRecords(parsed.records);
    setFilter({
      search: '',
      warningFilter: 'ALL',
      hazardFilter: 'ALL',
      tempFilter: 'ALL',
      labFilter: 'ALL',
      sortBy: 'warn_rank',
      sortOrder: 'asc'
    });
    showToast('success', '데이터 초기화 완료', '표준 실습 데이터 80건으로 복원되었습니다.');
  }, []);

  // Handler: Import complete
  const handleImportComplete = useCallback((imported: RawReagentRecord[]) => {
    setRawRecords(imported);
    setFilter({
      search: '',
      warningFilter: 'ALL',
      hazardFilter: 'ALL',
      tempFilter: 'ALL',
      labFilter: 'ALL',
      sortBy: 'warn_rank',
      sortOrder: 'asc'
    });
    showToast('success', '대장 반입 성공', `총 ${imported.length}건의 시약 데이터가 등록되었습니다.`);
  }, []);

  // Handler: Export CSV
  const handleExportCsv = useCallback(() => {
    const csvContent = exportToCsvText(rawRecords);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reagent_inventory_${BASE_DATE}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'CSV 내보내기 완료', '현재 재고대장 파일이 다운로드되었습니다.');
  }, [rawRecords]);

  // Handler: Copy order candidates TSV (F-08)
  const handleCopyOrderList = useCallback(async () => {
    try {
      const tsv = formatOrderCandidatesTSV(evaluatedRecords);
      await navigator.clipboard.writeText(tsv);
      showToast(
        'success',
        '발주 후보 목록 클립보드 복사 완료',
        `만료·임박·부족 ${orderCandidatesCount}건이 엑셀 붙여넣기 형식(TSV)으로 복사되었습니다.`
      );
    } catch (e) {
      showToast('error', '복사 실패', '클립보드 권한을 확인해주세요.');
    }
  }, [evaluatedRecords, orderCandidatesCount]);

  // Handler: Quick filter from summary cards
  const handleSelectWarningFilter = useCallback((warningType: WarningFilterType) => {
    setFilter((prev) => ({ ...prev, warningFilter: warningType }));
  }, []);

  // Handler: Reset filters only
  const handleResetFilter = useCallback(() => {
    setFilter({
      search: '',
      warningFilter: 'ALL',
      hazardFilter: 'ALL',
      tempFilter: 'ALL',
      labFilter: 'ALL',
      sortBy: 'warn_rank',
      sortOrder: 'asc'
    });
  }, []);

  // Handler: Open duplicate modal for specific CAS
  const handleOpenDuplicateForCas = useCallback((cas: string) => {
    setSelectedCasForDup(cas);
    setIsDuplicateModalOpen(true);
  }, []);

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400">인증 상태 확인 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginScreen
          onLoginSuccess={() => {
            const client = getSupabaseClient();
            client?.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
          }}
          onOpenSetup={() => setIsSupabaseSetupOpen(true)}
        />
        {isSupabaseSetupOpen && (
          <SupabaseSetupModal
            onClose={() => setIsSupabaseSetupOpen(false)}
            onConfigSaved={() => {
              setIsSupabaseSetupOpen(false);
              const client = getSupabaseClient();
              client?.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
            }}
          />
        )}
        <Toast toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 pb-16">
      {/* Top Navigation */}
      <Navbar
        baseDate={BASE_DATE}
        totalCount={rawRecords.length}
        orderCandidatesCount={orderCandidatesCount}
        userEmail={user?.email}
        onOpenImport={() => setIsImportModalOpen(true)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onCopyOrderList={handleCopyOrderList}
        onExportCsv={handleExportCsv}
        onResetToDefault={handleResetToDefault}
        onOpenDuplicateModal={() => {
          setSelectedCasForDup(undefined);
          setIsDuplicateModalOpen(true);
        }}
        onOpenSupabaseSetup={() => setIsSupabaseSetupOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5 space-y-4 flex-1">
        {/* Warning Summary Dashboard (PRD 5.8 / S-02) */}
        <DashboardStats
          stats={stats}
          activeFilter={filter.warningFilter}
          onSelectFilter={handleSelectWarningFilter}
          onOpenDuplicateModal={() => {
            setSelectedCasForDup(undefined);
            setIsDuplicateModalOpen(true);
          }}
          baseDate={BASE_DATE}
        />

        {/* Filter and Search Bar (PRD 5.7) */}
        <FilterBar
          filter={filter}
          onFilterChange={setFilter}
          onResetFilter={handleResetFilter}
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
          filteredCount={displayRecords.length}
          totalCount={rawRecords.length}
        />

        {/* Reagent List / Table View (PRD S-02) */}
        <ReagentList
          records={displayRecords}
          viewMode={viewMode}
          onSelectRecord={handleSelectRecord}
          onDeleteRecord={handleDeleteRecord}
          onResetFilter={handleResetFilter}
          onOpenDuplicateModalForCas={handleOpenDuplicateForCas}
        />
      </main>

      {/* Reagent Detail & Edit Modal (PRD S-03) */}
      {selectedRecord && (
        <ReagentDetailModal
          record={selectedRecord}
          duplicateGroup={selectedRecordDupGroup}
          onClose={() => setSelectedRecordId(null)}
          onSave={handleUpdateRecord}
          onDelete={handleDeleteRecord}
        />
      )}

      {/* Duplicate Candidates Group Inspector Modal (PRD 5.5) */}
      {isDuplicateModalOpen && (
        <DuplicateGroupsModal
          groups={duplicateGroups}
          initialSelectedCas={selectedCasForDup}
          onClose={() => {
            setIsDuplicateModalOpen(false);
            setSelectedCasForDup(undefined);
          }}
          onSelectRecord={(r) => {
            setIsDuplicateModalOpen(false);
            setSelectedRecordId(r.reagent_id);
          }}
        />
      )}

      {/* Import CSV / XLSX / Paste Modal (PRD S-01) */}
      {isImportModalOpen && (
        <ImportModal
          onClose={() => setIsImportModalOpen(false)}
          onImportComplete={handleImportComplete}
        />
      )}

      {/* Add New Reagent Form Modal */}
      {isAddModalOpen && (
        <ReagentFormModal
          nextId={nextReagentId}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddRecord}
        />
      )}

      {/* Supabase Setup Modal */}
      {isSupabaseSetupOpen && (
        <SupabaseSetupModal
          onClose={() => setIsSupabaseSetupOpen(false)}
          onConfigSaved={() => {
            setIsSupabaseSetupOpen(false);
            const client = getSupabaseClient();
            client?.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
          }}
        />
      )}

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
