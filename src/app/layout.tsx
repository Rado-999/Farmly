import type { Metadata } from "next";
import { Geist_Mono, Newsreader, Source_Sans_3 } from "next/font/google";

import { LanguageProvider } from "@/components/i18n/language-provider";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { NavigationShell } from "@/components/layout/navigation-shell";
import { getLocaleHtmlLang } from "@/lib/i18n/config";
import { getServerLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";

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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();

  return {
    title: "Farmly",
    description: translate(
      locale,
      "Спокойна дигитална селска местност — запознайте се с истински фермери, гледайте техните сезони и се почувствайте част от общността, преди да купувате.",
      "A calm digital countryside where you can meet real farmers, watch their seasons, and feel part of the community before you buy.",
    ),
    icons: {
      icon: "/brand/farmly-logo.png",
      apple: "/brand/farmly-logo.png",
    },
    openGraph: {
      images: [
        {
          url: "/brand/farmly-logo.png",
          width: 454,
          height: 525,
          alt: "Farmly",
        },
      ],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();

  return (
    <html
      lang={getLocaleHtmlLang(locale)}
      suppressHydrationWarning
      className={`${bodyFont.variable} ${displayFont.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="flex min-h-full flex-col font-sans"
      >
        <LanguageProvider initialLocale={locale}>
          <NavigationShell />
          <Header />
          <div className="flex flex-1 flex-col">{children}</div>
          <Footer />
        </LanguageProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){function start(){var header=document.querySelector("header");if(!header)return;function sync(){var height=Math.round(header.getBoundingClientRect().height);document.documentElement.style.setProperty("--site-header-height",height+"px");}sync();if("ResizeObserver"in window){var observer=new ResizeObserver(sync);observer.observe(header);}window.addEventListener("resize",sync,{passive:true});}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();})();`,
          }}
        />
      </body>
    </html>
  );
}
