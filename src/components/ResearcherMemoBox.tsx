import React, { useState, useEffect } from 'react';
import { getSupabaseClient } from '../lib/supabaseClient';
import { FileText, Save, Trash2, Shield, Sparkles, CheckCircle2 } from 'lucide-react';

interface ResearcherMemoBoxProps {
  reagentId: string;
}

export const ResearcherMemoBox: React.FC<ResearcherMemoBoxProps> = ({ reagentId }) => {
  const [memoContent, setMemoContent] = useState('');
  const [memoId, setMemoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [tableExists, setTableExists] = useState<boolean | null>(null);

  useEffect(() => {
    fetchMyMemo();
  }, [reagentId]);

  const fetchMyMemo = async () => {
    const client = getSupabaseClient();
    if (!client) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const { data: { user } } = await client.auth.getUser();
      if (!user) return;

      const { data, error } = await client
        .from('reagent_notes')
        .select('*')
        .eq('reagent_id', reagentId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          setTableExists(false);
        } else {
          throw error;
        }
      } else {
        setTableExists(true);
        if (data) {
          setMemoId(data.id);
          setMemoContent(data.note_content || '');
        } else {
          setMemoId(null);
          setMemoContent('');
        }
      }
    } catch (err: any) {
      console.error('Error fetching memo:', err);
      setErrorMsg(err.message || '메모를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMemo = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = getSupabaseClient();
    if (!client) {
      setErrorMsg('Supabase 클라이언트가 설정되지 않았습니다.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(false);

    try {
      const { data: { user } } = await client.auth.getUser();
      if (!user) throw new Error('로그인된 사용자 정보를 찾을 수 없습니다.');

      if (memoId) {
        const { error } = await client
          .from('reagent_notes')
          .update({ note_content: memoContent, updated_at: new Date().toISOString() })
          .eq('id', memoId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { data, error } = await client
          .from('reagent_notes')
          .insert({
            user_id: user.id,
            reagent_id: reagentId,
            note_content: memoContent
          })
          .select()
          .single();

        if (error) throw error;
        if (data) setMemoId(data.id);
      }

      setTableExists(true);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 2500);
    } catch (err: any) {
      console.error('Error saving memo:', err);
      if (err.code === '42P01' || err.message?.includes('relation') || err.message?.includes('does not exist')) {
        setTableExists(false);
        setErrorMsg('Supabase에 `reagent_notes` 테이블이 생성되지 않았습니다. 아래 안내된 SQL을 Supabase SQL Editor에서 실행해주세요.');
      } else {
        setErrorMsg(err.message || '메모 저장 중 오류가 발생했습니다.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMemo = async () => {
    if (!memoId) return;
    if (!window.confirm('작성하신 개인 메모를 삭제하시겠습니까?')) return;

    const client = getSupabaseClient();
    if (!client) return;

    try {
      const { data: { user } } = await client.auth.getUser();
      if (!user) return;

      const { error } = await client
        .from('reagent_notes')
        .delete()
        .eq('id', memoId)
        .eq('user_id', user.id);

      if (error) throw error;

      setMemoId(null);
      setMemoContent('');
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 2500);
    } catch (err: any) {
      setErrorMsg(err.message || '메모 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 text-white rounded-lg">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>연구원 개인 보안 메모</span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded">
                <Shield className="w-3 h-3 text-emerald-600" />
                본인만 열람 가능
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              이 시약에 대해 본인 계정만 볼 수 있는 비공개 연구 노트 및 특이사항을 기록합니다.
            </p>
          </div>
        </div>
      </div>

      {tableExists === false && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs text-amber-900 space-y-2">
          <p className="font-bold flex items-center gap-1">
            <span>⚠️ Supabase `reagent_notes` 테이블 생성 필요</span>
          </p>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            개인 메모 기능을 활성화하려면 Supabase 대시보드의 <strong>SQL Editor</strong>에서 아래 쿼리를 한 번 실행해주세요.
          </p>
          <pre className="bg-slate-900 text-emerald-400 p-2.5 rounded text-[10px] font-mono overflow-x-auto select-all">
{`create table public.reagent_notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null default auth.uid(),
  reagent_id text not null,
  note_content text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.reagent_notes enable row level security;

create policy "Users can view their own notes" on public.reagent_notes for select using (auth.uid() = user_id);
create policy "Users can insert their own notes" on public.reagent_notes for insert with check (auth.uid() = user_id);
create policy "Users can update their own notes" on public.reagent_notes for update using (auth.uid() = user_id);
create policy "Users can delete their own notes" on public.reagent_notes for delete using (auth.uid() = user_id);`}
          </pre>
        </div>
      )}

      <form onSubmit={handleSaveMemo} className="space-y-2">
        <textarea
          rows={3}
          value={memoContent}
          onChange={(e) => setMemoContent(e.target.value)}
          placeholder="예: 금일 실험에서 pH 변화 관찰 완료. 분취 용량 재조정 필요. (본인만 조회 가능)"
          className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-800 placeholder-slate-400"
        />

        {errorMsg && (
          <div className="p-2 bg-rose-50 border border-rose-200 text-rose-800 text-[11px] rounded">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] rounded flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>메모가 Supabase에 안전하게 저장되었습니다 (본인 전용).</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          {memoId ? (
            <button
              type="button"
              onClick={handleDeleteMemo}
              className="px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              메모 삭제
            </button>
          ) : (
            <div className="text-[11px] text-slate-400">작성 시 Supabase 개인 노트에 저장됩니다.</div>
          )}

          <button
            type="submit"
            disabled={saving || loading}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center gap-1 cursor-pointer transition-colors shadow-xs disabled:opacity-50 ml-auto"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? '저장 중...' : '개인 메모 저장'}
          </button>
        </div>
      </form>
    </div>
  );
};
