import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GlobalNav from '@/components/GlobalNav';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://sonpyeong.kr'),
  title: {
    default: "손평패스 - 손해평가사 기출문제 CBT 무료 풀이",
    template: "%s | 손평패스",
  },
  description: "손해평가사 1차 국가자격시험 대비 무료 CBT 기출문제 풀이 사이트. 최근 5개년 기출문제, 오답 노트, 플래시카드, 핵심 요약 노트를 제공합니다. 회원가입 없이 바로 시작하세요.",
  keywords: [
    "손해평가사", "손해평가사 기출문제", "손해평가사 1차", "손해평가사 CBT",
    "손해평가사 시험", "손해평가사 자격증", "농어업재해보험법", "상법 보험편",
    "재배학 원예작물학", "손해평가사 합격", "손평패스", "손해평가사 무료"
  ],
  authors: [{ name: "손평패스" }],
  creator: "손평패스",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://sonpyungpass.com",
    siteName: "손평패스",
    title: "손평패스 - 손해평가사 기출문제 CBT 무료 풀이",
    description: "손해평가사 1차 시험 최근 5개년 기출문제를 무료로 풀어보세요. 회원가입 없이 바로 시작. 오답 노트·플래시카드·핵심 요약 노트 제공.",
  },
  twitter: {
    card: "summary_large_image",
    title: "손평패스 - 손해평가사 기출문제 CBT 무료",
    description: "손해평가사 1차 기출문제 무료 CBT. 회원가입 없이, 지금 바로 시작하세요.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "손평패스",
  url: "https://sonpyungpass.com",
  description: "손해평가사 1차 국가자격시험 대비 무료 CBT 기출문제 풀이 서비스",
  inLanguage: "ko",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://sonpyungpass.com/exams",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <GlobalNav />
        <main className="max-w-5xl mx-auto min-h-screen bg-white shadow-lg relative">
          {children}
        </main>
      </body>
    </html>
  );
}
