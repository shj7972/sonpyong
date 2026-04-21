import type { Metadata } from 'next';
import Link from 'next/link';
import { getExamSessions } from '@/lib/data';
import { BookOpen, ChevronRight, Clock, Info, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
    title: '손해평가사 1차 기출문제 CBT | 손평패스',
    description: '손해평가사 1차 시험 최근 5개년 기출문제를 연습모드·실전모드로 풀어보세요. 상법(보험편), 농어업재해보험법령, 재배학 및 원예작물학 전 과목 수록.',
};

export default function ExamsPage() {
    const sessions = getExamSessions();

    return (
        <div className="pb-20">
            <header className="bg-blue-600 text-white p-6 rounded-b-3xl shadow-md">
                <Link href="/" className="text-blue-200 text-sm mb-2 block hover:text-white transition-colors">
                    ← 메인으로
                </Link>
                <h1 className="text-2xl font-bold mb-1">기출문제 목록</h1>
                <p className="text-blue-100 opacity-90">손해평가사 1차 최근 5개년 기출문제</p>
            </header>

            <div className="p-5">
                {/* 모드 안내 */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-5">
                    <h2 className="font-bold text-slate-700 text-sm mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-500" />
                        풀이 모드 안내
                    </h2>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                            <div className="font-bold text-green-700 mb-1 flex items-center gap-1">
                                <BookOpen className="w-3.5 h-3.5" /> 연습모드
                            </div>
                            <p className="text-slate-600">문제 풀이 후 즉시 정답/해설 확인. 시간 제한 없음.</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                            <div className="font-bold text-blue-700 mb-1 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> 실전모드
                            </div>
                            <p className="text-slate-600">실제 시험처럼 타이머 작동. 마지막에 결과 확인.</p>
                        </div>
                    </div>
                </div>

                {/* 시험 과목 안내 */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-5 shadow-sm">
                    <h2 className="font-bold text-slate-700 text-sm mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        수록 과목 (1차 시험 전 과목)
                    </h2>
                    <ul className="text-xs text-slate-600 space-y-1.5">
                        <li className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">1</span>
                            상법 (보험편) — 보험계약법, 손해보험, 인보험
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">2</span>
                            농어업재해보험법령 — 재해보험, 손해평가사 규정
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center shrink-0">3</span>
                            재배학 및 원예작물학 — 작물 재배, 원예, 병충해
                        </li>
                    </ul>
                </div>

                {/* 기출문제 목록 */}
                <h2 className="font-bold text-slate-800 text-base mb-3">회차별 기출문제</h2>
                <div className="space-y-4">
                    {sessions.map((session) => (
                        <div
                            key={`${session.year}-${session.round}`}
                            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                            {session.year}년
                                        </span>
                                        <span className="text-slate-500 text-xs">
                                            제{session.round}회
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800">
                                        {session.year}년 손해평가사 1차 기출문제
                                    </h3>
                                    <p className="text-slate-500 text-sm mt-1">
                                        총 {session.questionCount}문제 · 3과목
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <Link
                                    href={`/exam/${session.year}/${session.round}?mode=practice`}
                                    className="flex-1 bg-green-50 text-green-700 font-bold py-3 rounded-xl border border-green-200 hover:bg-green-100 flex items-center justify-center gap-2 transition-colors"
                                >
                                    <BookOpen className="w-4 h-4" />
                                    연습모드
                                </Link>
                                <Link
                                    href={`/exam/${session.year}/${session.round}?mode=exam`}
                                    className="flex-1 bg-blue-50 text-blue-700 font-bold py-3 rounded-xl border border-blue-200 hover:bg-blue-100 flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Clock className="w-4 h-4" />
                                    실전모드
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 하단 안내 */}
                <div className="mt-8 p-5 bg-yellow-50 border border-yellow-100 rounded-2xl text-sm text-slate-600">
                    <strong className="block text-slate-800 mb-1">합격 팁</strong>
                    손해평가사 1차 시험은 절대평가입니다. 과목별 40점 이상, 평균 60점 이상이면 합격합니다.
                    문제은행 방식으로 출제되므로 최근 5년치 기출문제를 반복해서 풀면 합격 확률이 크게 올라갑니다.
                </div>
            </div>
        </div>
    );
}
