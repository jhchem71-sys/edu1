import React, { useState } from 'react';
import { getSupabaseClient, getStoredSupabaseConfig } from '../lib/supabaseClient';
import { FlaskConical, Lock, Mail, ArrowRight, UserPlus, LogIn, Settings, AlertTriangle } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onOpenSetup: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onOpenSetup }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const config = getStoredSupabaseConfig();
  const isConfigured = Boolean(config.url && config.anonKey);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfigured) {
      setErrorMsg('먼저 Supabase 프로젝트 설정(URL 및 Anon Key)을 완료해주세요.');
      return;
    }

    const client = getSupabaseClient();
    if (!client) {
      setErrorMsg('Supabase 클라이언트를 초기화할 수 없습니다. 설정을 확인해주세요.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        const { data, error } = await client.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        setSuccessMsg('회원가입이 완료되었습니다! 이메일 인증이 필요할 수 있습니다. 바로 로그인 시도해주세요.');
        setIsSignUp(false);
      } else {
        const { data, error } = await client.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        onLoginSuccess();
      }
    } catch (err: any) {
      setErrorMsg(err.message || '인증 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-8">
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex p-3 bg-blue-600/20 border border-blue-500/30 rounded-2xl text-blue-400 mb-1">
            <FlaskConical className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-extrabold text-white">시약·시료 재고 관리대장</h1>
          <p className="text-xs text-slate-400">
            시스템 이용을 위해 Supabase 계정으로 로그인해주세요.
          </p>
        </div>

        {/* Supabase Config Status Banner */}
        {!isConfigured ? (
          <div className="bg-amber-950/80 border border-amber-700/80 rounded-xl p-4 mb-6 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-amber-200">Supabase 설정 필요</h3>
                <p className="text-[11px] text-amber-300/90">
                  로그인 및 데이터 저장을 위해 Supabase 프로젝트 URL과 Anon Key를 먼저 설정해주세요.
                </p>
              </div>
            </div>
            <button
              onClick={onOpenSetup}
              className="w-full py-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Supabase 설정 입력하기</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-slate-900/60 border border-slate-700/80 rounded-xl px-4 py-2.5 mb-6 text-xs text-slate-300">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
              <span className="font-mono truncate text-[11px]">{config.url}</span>
            </div>
            <button
              onClick={onOpenSetup}
              className="text-blue-400 hover:text-blue-300 font-semibold underline text-[11px] cursor-pointer shrink-0 ml-2"
            >
              설정 변경
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">이메일 주소</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="researcher@lab.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-200 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs rounded-lg">
              {successMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !isConfigured}
            className="w-full py-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <span>처리 중...</span>
            ) : isSignUp ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Supabase 회원가입</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>로그인</span>
              </>
            )}
          </button>
        </form>

        {/* Mode Toggle */}
        <div className="mt-6 text-center pt-4 border-t border-slate-700/80">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="text-xs text-slate-400 hover:text-white cursor-pointer"
          >
            {isSignUp ? '이미 계정이 있으신가요? 로그인하기' : '계정이 없으신가요? Supabase 회원가입'}
          </button>
        </div>
      </div>
    </div>
  );
};
