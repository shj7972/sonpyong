import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export const metadata: Metadata = {
    title: '개인정보처리방침 | 손평패스',
    description: '손평패스 서비스의 개인정보처리방침을 안내합니다.',
};

export default function PrivacyPage() {
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
                <div className="mb-10 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900">개인정보처리방침</h1>
                        <p className="text-slate-500 text-sm mt-0.5">최종 수정일: 2026년 4월 21일</p>
                    </div>
                </div>

                <div className="space-y-8 text-slate-700 leading-relaxed">
                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-3">1. 총칙</h2>
                        <p className="text-sm">
                            손평패스(이하 "서비스")는 손해평가사 자격시험 학습을 지원하는 무료 웹 서비스입니다.
                            본 방침은 서비스 이용 과정에서 수집되는 정보의 처리 방식을 안내합니다.
                            이용자의 개인정보 보호를 최우선으로 여기며, <strong>서버에 개인정보를 수집·저장하지 않는</strong> Privacy-First 방식으로 운영합니다.
                        </p>
                    </section>

                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-3">2. 수집하는 정보</h2>
                        <div className="space-y-4 text-sm">
                            <div>
                                <h3 className="font-bold text-slate-800 mb-1">가. 서버에 수집하지 않는 정보</h3>
                                <p className="text-slate-600">
                                    본 서비스는 회원가입이 없으며, 이름·이메일·연락처 등 어떠한 개인식별정보도 서버에 수집하지 않습니다.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 mb-1">나. 기기(브라우저) 내 저장 정보</h3>
                                <p className="text-slate-600 mb-2">
                                    학습 기능 제공을 위해 이용자 기기의 <strong>로컬 스토리지(localStorage)</strong>에 아래 정보가 저장됩니다. 이 정보는 인터넷을 통해 전송되거나 서버에 저장되지 않으며, 이용자가 언제든 직접 삭제할 수 있습니다.
                                </p>
                                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                                    <li>오답 문제 목록 및 풀이 기록</li>
                                    <li>플래시카드 학습 진행 상태</li>
                                    <li>설정 값 (다크모드, 글자 크기 등)</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 mb-1">다. 광고 서비스 (Google AdSense)</h3>
                                <p className="text-slate-600">
                                    본 서비스는 Google AdSense를 통해 광고를 게재합니다. Google은 쿠키(Cookie)를 사용하여 이용자의 관심사에 기반한 광고를 제공할 수 있습니다.
                                    Google의 광고 쿠키 사용에 대한 자세한 내용은{' '}
                                    <a
                                        href="https://policies.google.com/technologies/ads"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-emerald-600 underline"
                                    >
                                        Google 개인정보처리방침
                                    </a>
                                    에서 확인하실 수 있으며,{' '}
                                    <a
                                        href="https://www.google.com/settings/ads"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-emerald-600 underline"
                                    >
                                        광고 설정 페이지
                                    </a>
                                    에서 맞춤 광고를 거부할 수 있습니다.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-3">3. 쿠키(Cookie) 정책</h2>
                        <p className="text-sm text-slate-600">
                            본 서비스 자체는 쿠키를 사용하지 않습니다. 다만, 광고 파트너인 Google AdSense가 광고 최적화 목적으로 쿠키를 사용할 수 있습니다.
                            브라우저 설정에서 쿠키를 비활성화할 수 있으나, 일부 광고 기능이 제한될 수 있습니다.
                        </p>
                    </section>

                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-3">4. 제3자 제공</h2>
                        <p className="text-sm text-slate-600">
                            본 서비스는 수집된 정보를 제3자에게 제공·공유·판매하지 않습니다.
                            단, Google AdSense 광고 게재를 위해 Google LLC와 기술적으로 연동됩니다.
                        </p>
                    </section>

                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-3">5. 이용자 권리</h2>
                        <div className="text-sm text-slate-600 space-y-2">
                            <p>이용자는 다음과 같은 방법으로 본인의 데이터를 관리할 수 있습니다.</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>브라우저 설정 → 사이트 데이터 삭제를 통해 로컬 스토리지 데이터 전체 삭제</li>
                                <li>서비스 내 <Link href="/settings" className="text-emerald-600 underline">설정 페이지</Link>에서 학습 데이터 초기화</li>
                            </ul>
                        </div>
                    </section>

                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-3">6. 만 14세 미만 이용자</h2>
                        <p className="text-sm text-slate-600">
                            본 서비스는 만 14세 미만 아동의 개인정보를 의도적으로 수집하지 않습니다.
                        </p>
                    </section>

                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-3">7. 방침의 변경</h2>
                        <p className="text-sm text-slate-600">
                            본 방침은 관련 법령 및 서비스 변경에 따라 수정될 수 있습니다. 변경 시 페이지 상단의 "최종 수정일"을 업데이트합니다.
                        </p>
                    </section>

                    <section className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-3">8. 문의</h2>
                        <p className="text-sm text-slate-600">
                            개인정보처리방침에 관한 문의사항은 아래 이메일로 연락해 주시기 바랍니다.
                        </p>
                        <p className="mt-3 font-bold text-emerald-700">seo.hyunjong@gmail.com</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
