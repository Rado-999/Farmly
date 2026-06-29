import Image from "next/image";

import { PageSection } from "@/components/ui/page-section";
import { ImageCaptionPanel } from "@/components/ui/image-caption-panel";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import type { AtmosphereChapter } from "@/lib/landing/narrative";
import { landingImages } from "@/lib/landing/visuals";

type AtmosphereChapterSectionProps = {
  chapter: AtmosphereChapter;
};

const toneMap = {
  mist: "parchment",
  dawn: "dawn",
  depth: "depth",
} as const;

function splitCaption(caption: string) {
  const firstSentenceEnd = caption.indexOf(".");
  if (firstSentenceEnd === -1) {
    return { lead: caption, rest: null };
  }

  return {
    lead: caption.slice(0, firstSentenceEnd + 1),
    rest: caption.slice(firstSentenceEnd + 1).trim() || null,
  };
}

export function AtmosphereChapterSection({ chapter }: AtmosphereChapterSectionProps) {
  const image = landingImages[chapter.imageKey];
  const imageFirst = chapter.align !== "right";
  const sectionTone = toneMap[chapter.tone ?? "mist"];
  const captionParts = chapter.caption ? splitCaption(chapter.caption) : null;

  return (
    <PageSection id={chapter.id} tone={sectionTone} spacing="default" texture>
      <div className="page-shell-wide">
        <div
          className={`layout-split lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center ${
            imageFirst ? "" : "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1"
          }`}
        >
          <RevealOnScroll direction={imageFirst ? "right" : "left"}>
            <figure className="relative aspect-[4/5] overflow-hidden rounded-sm shadow-[0_40px_80px_-40px_rgba(26,22,16,0.5)] sm:aspect-[5/6] lg:-mx-4">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 46vw"
                className="object-cover cinematic-ken-burns-slow"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(0deg,rgba(31,48,34,0.35)_0%,transparent_40%,rgba(31,48,34,0.06)_100%)]"
              />
              {captionParts ? (
                <ImageCaptionPanel>
                  <span className="image-caption-lead">{captionParts.lead}</span>
                  {captionParts.rest ? ` ${captionParts.rest}` : null}
                </ImageCaptionPanel>
              ) : null}
            </figure>
          </RevealOnScroll>

          <RevealOnScroll direction={imageFirst ? "left" : "right"}>
            <div className="stack-relaxed lg:px-6 xl:px-10">
              <p className="type-kicker">{chapter.kicker}</p>
              <h2 className="type-chapter text-loam-900">{chapter.title}</h2>
              <p className="max-w-lg type-body text-loam-700/90">
                {chapter.body}
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </PageSection>
  );
}
