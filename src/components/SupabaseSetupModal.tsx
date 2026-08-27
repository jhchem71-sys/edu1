import React, { useState } from 'react';
import { getStoredSupabaseConfig, saveStoredSupabaseConfig, getSupabaseClient } from '../lib/supabaseClient';
import { Database, Key, Globe, X, CheckCircle, AlertCircle, Save } from 'lucide-react';

interface SupabaseSetupModalProps {
  onClose: () => void;
  onConfigSaved: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ onClose, onConfigSaved }) => {
  const currentConfig = getStoredSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      setTestResult({ success: false, message: 'Supabase URL과 Anon Key를 모두 입력해주세요.' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      saveStoredSupabaseConfig({ url, anonKey });
      const client = getSupabaseClient();
      if (!client) {
        throw new Error('Supabase 클라이언트 생성 실패');
      }

      // Test connection with auth getSession
      const { data, error } = await client.auth.getSession();
      if (error) {
        throw error;
      }

      setTestResult({ success: true, message: 'Supabase 연결 성공! 설정이 저장되었습니다.' });
      setTimeout(() => {
        onConfigSaved();
        onClose();
      }, 1000);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `연결 실패: ${err.message || 'URL 또는 Key를 확인해주세요.'}`
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div
      id="modal-supabase-setup"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold">Supabase 프로젝트 설정</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleTestAndSave} className="p-6 space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900">
            <p className="font-semibold mb-1">💡 Supabase 연동 안내</p>
            <p className="leading-relaxed text-emerald-800">
              Supabase 프로젝트 대시보드(Settings &gt; API)에서 <strong className="font-mono">Project URL</strong>과 <strong className="font-mono">anon / public API key</strong>를 복사하여 아래에 입력해주세요. 로그인 및 회원가입 데이터가 Supabase Auth에 안전하게 저장됩니다.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-slate-500" />
              <span>Supabase Project URL *</span>
            </label>
            <input
              type="url"
              required
              placeholder="https://your-project.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-2.5 text-xs font-mono border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-slate-500" />
              <span>Supabase Anon / Public Key *</span>
            </label>
            <input
              type="password"
              required
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full p-2.5 text-xs font-mono border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                  : 'bg-rose-50 text-rose-900 border border-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="font-medium">{testResult.message}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={testing}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {testing ? '연결 테스트 중...' : '저장 및 연결'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
