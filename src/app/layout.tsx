import type { Metadata } from "next";
import { Geist_Mono, Newsreader, Source_Sans_3 } from "next/font/google";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { NavigationShell } from "@/components/layout/navigation-shell";

import "./globals.css";

const bodyFont = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin", "cyrillic"],
});

const displayFont = Newsreader({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Farmly",
  description:
    "Спокойна дигитална селска местност — запознайте се с истински фермери, гледайте техните сезони и се почувствайте част от общността, преди да купувате.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bg"
      suppressHydrationWarning
      className={`${bodyFont.variable} ${displayFont.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="flex min-h-full flex-col font-sans"
      >
        <NavigationShell />
        <Header />
        <div className="flex flex-1 flex-col">{children}</div>
        <Footer />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){function start(){var header=document.querySelector("header");if(!header)return;function sync(){var height=Math.round(header.getBoundingClientRect().height);document.documentElement.style.setProperty("--site-header-height",height+"px");}sync();if("ResizeObserver"in window){var observer=new ResizeObserver(sync);observer.observe(header);}window.addEventListener("resize",sync,{passive:true});}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();})();`,
          }}
        />
      </body>
    </html>
  );
}
