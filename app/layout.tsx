import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import { RouteProgressBar } from "@/components/layout/RouteProgressBar";
import "./globals.css";
export const metadata:Metadata={title:{default:"Bandhanaa",template:"%s | Bandhanaa"},description:"Meaningful connections begin here."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><body suppressHydrationWarning><Suspense fallback={null}><RouteProgressBar /></Suspense>{children}<Script id="bandhanaa-theme" strategy="beforeInteractive">{`try{const saved=localStorage.getItem('bandhanaa-theme');const dark=saved==='dark'||(!saved&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',dark);document.documentElement.style.colorScheme=dark?'dark':'light'}catch{}`}</Script></body></html>}
