'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu as MenuIcon, X, Home, BookOpen, Layers, AlertCircle, Settings, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function GlobalNav() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Close menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <>
            {/* Hamburger Button (Fixed Top-Right) */}
            <button
                onClick={() => setIsOpen(true)}
                className={cn(
                    "fixed top-4 right-4 z-50 p-2.5 rounded-full shadow-lg transition-all active:scale-95",
                    isOpen ? "opacity-0 pointer-events-none" : "opacity-100", // Hide when open (close button takes over)
                    // If we are on home page, maybe blend in? 
                    // For now, let's make it consistently stand out or be glassmorphism.
                    "bg-white/80 backdrop-blur-md text-slate-700 border border-slate-200 hover:bg-white"
                )}
                aria-label="메뉴 열기"
            >
                <MenuIcon className="w-6 h-6" />
            </button>

            {/* Overlay Menu */}
            {isOpen && (
                <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsOpen(false)}>

                    {/* Drawer */}
                    <div
                        className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-2xl p-6 slide-in-from-right animate-in duration-300 flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Drawer Header */}
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-2">
                                <Award className="w-6 h-6 text-emerald-500" />
                                <span className="font-bold text-lg text-slate-800">손평패스</span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                aria-label="메뉴 닫기"
                            >
                                <X className="w-6 h-6 text-slate-500" />
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <nav className="flex-1 space-y-2 overflow-y-auto">
                            <NavLink href="/" icon={Home} label="홈으로" isActive={pathname === '/'} />
                            <div className="my-2 border-t border-slate-100"></div>

                            <NavLink href="/exams" icon={BookOpen} label="기출문제 풀이" isActive={pathname === '/exams'} />
                            <NavLink href="/flashcards" icon={Layers} label="플래시카드" isActive={pathname === '/flashcards'} />
                            <NavLink href="/mistakes" icon={AlertCircle} label="오답 노트" isActive={pathname === '/mistakes'} />

                            <div className="my-2 border-t border-slate-100"></div>
                            <NavLink href="/settings" icon={Settings} label="설정 및 초기화" isActive={pathname === '/settings'} />
                            <NavLink href="/about" icon={Award} label="서비스 소개" isActive={pathname === '/about'} />
                        </nav>

                        {/* Footer Info */}
                        <div className="mt-8 text-center">
                            <p className="text-[10px] text-slate-400">
                                © 2026 손평패스<br />
                                개인정보를 저장하지 않는 안전한 학습 도구
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function NavLink({ href, icon: Icon, label, isActive }: { href: string, icon: any, label: string, isActive: boolean }) {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-3 p-3.5 rounded-xl font-medium transition-all duration-200",
                isActive
                    ? "bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
        >
            <Icon className={cn("w-5 h-5", isActive ? "text-emerald-500" : "text-slate-400")} />
            <span>{label}</span>
        </Link>
    );
}
