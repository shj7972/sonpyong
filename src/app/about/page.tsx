import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Award, BookOpen, Brain, Layers, ShieldCheck, Mail } from 'lucide-react';

export const metadata: Metadata = {
    title: '서비스 소개 | 손평패스',
    description: '손평패스는 손해평가사 1차 국가자격시험 대비를 위한 무료 CBT 기출문제 풀이 서비스입니다. 회원가입 없이 최근 5개년 기출문제를 풀 수 있습니다.',
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans">
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-bold">메인으로</span>
                    </Link>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-10">
                {/* Hero */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-3xl mb-4">
                        <Award className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-3">손평패스 소개</h1>
                    <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">
                        손해평가사 자격시험 합격을 위한 가장 효율적인 학습 도구.<br />
                        무료로, 로그인 없이, 지금 바로 시작하세요.
                    </p>
                </div>

                {/* Mission */}
                <section className="bg-gradient-to-br from-indigo-900 to-slate-800 text-white rounded-3xl p-8 mb-8 shadow-xl">
                    <h2 className="text-xl font-bold mb-3">서비스 운영 목적</h2>
                    <p className="text-slate-300 leading-relaxed text-sm">
                        손평패스는 손해평가사 1차 시험 준비생들이 고가의 유료 강의나 번거로운 회원가입 없이도
                        良質(양질)의 학습 도구를 사용할 수 있도록 제공하는 <strong className="text-emerald-400">무료 공익 학습 서비스</strong>입니다.
                        기출문제 풀이, 오답 관리, 플래시카드 등 합격에 필요한 모든 기능을 한 곳에서 제공합니다.
                    </p>
                </section>

                {/* Features */}
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-5">주요 기능</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-800 mb-2">기출문제 CBT</h3>
                            <p className="text-sm text-slate-600">
                                최근 5개년 손해평가사 1차 기출문제 전 과목을 수록했습니다.
                                연습모드와 실전모드 두 가지로 나누어 실제 시험과 동일한 환경을 경험할 수 있습니다.
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <div className="w-11 h-11 bg-red-50 text-red-500 rounded-xl flex items-center justify-center mb-4">
                                <Brain className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-800 mb-2">스마트 오답 노트</h3>
                            <p className="text-sm text-slate-600">
                                틀린 문제가 자동으로 저장됩니다. 반복 오답 문제를 집중 공략하여
                                약점을 빠르게 보완할 수 있습니다.
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <div className="w-11 h-11 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center mb-4">
                                <Layers className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-800 mb-2">플래시카드</h3>
                            <p className="text-sm text-slate-600">
                                시험에 자주 나오는 핵심 개념을 플래시카드로 암기하세요.
                                출퇴근 시간 틈틈이 활용하면 효과적입니다.
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-800 mb-2">핵심 요약 노트</h3>
                            <p className="text-sm text-slate-600">
                                시험장에 들어가기 직전 5분 만에 훑어볼 수 있는
                                3과목 핵심 요약 노트를 제공합니다. PDF/DOCX 다운로드도 가능합니다.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Exam Info */}
                <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">손해평가사 1차 시험 안내</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3">구분</th>
                                    <th className="px-4 py-3">내용</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                <tr>
                                    <td className="px-4 py-3 font-bold shrink-0">시험 과목</td>
                                    <td className="px-4 py-3">상법(보험편) / 농어업재해보험법령 / 재배학 및 원예작물학</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-bold">합격 기준</td>
                                    <td className="px-4 py-3">과목당 40점 이상, 전 과목 평균 60점 이상 (절대평가)</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-bold">시험 형식</td>
                                    <td className="px-4 py-3">객관식 5지선다형, 과목당 25문제 (총 75문제)</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-bold">주관 기관</td>
                                    <td className="px-4 py-3">농림축산식품부 (시행: 한국산업인력공단 큐넷)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Privacy Promise */}
                <section className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 mb-8">
                    <div className="flex items-start gap-4">
                        <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 mb-2">개인정보 보호 약속</h2>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                손평패스는 <strong>서버에 어떠한 개인정보도 수집하지 않습니다.</strong>
                                오답 기록, 플래시카드 진행 상태 등 모든 학습 데이터는 오직 이용자 본인의 기기(브라우저 로컬 스토리지)에만 저장됩니다.
                                회원가입이 필요 없으며, 이메일·이름·연락처 등을 요구하지 않습니다.
                            </p>
                            <Link href="/privacy" className="inline-block mt-3 text-sm font-bold text-emerald-700 hover:underline">
                                개인정보처리방침 전체 보기 →
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Contact */}
                <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                        <Mail className="w-5 h-5 text-slate-400" />
                        <h2 className="text-lg font-bold text-slate-800">문의 및 피드백</h2>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                        기출문제 오류 제보, 서비스 개선 제안, 기타 문의사항은 아래 이메일로 보내주세요.
                        소중한 피드백 하나하나를 검토하겠습니다.
                    </p>
                    <a href="mailto:seo.hyunjong@gmail.com" className="font-bold text-emerald-700 hover:underline">
                        seo.hyunjong@gmail.com
                    </a>
                    <p className="text-xs text-slate-400 mt-4">
                        본 서비스는 상업적 이익을 목적으로 하지 않으며, 기출문제의 저작권은 해당 출제 기관에 있습니다.
                    </p>
                </section>
            </div>
        </div>
    );
}
