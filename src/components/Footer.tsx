import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gradient-to-br from-indigo-900 to-slate-800 text-white/70 py-12 text-center text-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <div className="max-w-5xl mx-auto px-6 relative z-10">
                <p className="font-bold text-white mb-2">손평패스 - 손해평가사 기출문제 CBT</p>
                <p className="mb-4 opacity-60">
                    본 서비스는 기출문제 풀이 연습을 위해 제공되며, 실제 시험과 다를 수 있습니다.<br />
                    모든 문제의 저작권은 출제 기관에 있습니다.
                </p>
                <div className="flex items-center justify-center gap-4 mb-6 text-xs">
                    <Link href="/about" className="text-white/60 hover:text-white transition-colors">
                        서비스 소개
                    </Link>
                    <span className="text-white/20">|</span>
                    <Link href="/privacy" className="text-white/60 hover:text-white transition-colors">
                        개인정보처리방침
                    </Link>
                    <span className="text-white/20">|</span>
                    <a href="mailto:seo.hyunjong@gmail.com" className="text-white/60 hover:text-white transition-colors">
                        문의하기
                    </a>
                </div>
                <p className="text-xs text-white/50">
                    Copyright © 2026 손평패스. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
