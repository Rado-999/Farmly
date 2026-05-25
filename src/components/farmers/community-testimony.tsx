"use client";

import { useState } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { pickFeaturedTestimonies } from "@/lib/farmers/profile-helpers";
import type { FarmerReview } from "@/lib/farmers/types";

type CommunityTestimonyProps = {
  reviews: FarmerReview[];
};

export function CommunityTestimony({ reviews }: CommunityTestimonyProps) {
  const [showAll, setShowAll] = useState(false);
  const featured = pickFeaturedTestimonies(reviews, 3);
  const visible = showAll ? reviews : featured;

  return (
    <PageSection id="testimony" tone="hearth" spacing="default">
      <div className="page-shell">
        <RevealOnScroll>
          <p className="text-[0.8125rem] font-medium tracking-[0.14em] text-clay uppercase">
            Бележки от общността
          </p>
          <h2 className="editorial-serif mt-3 max-w-2xl text-3xl leading-tight text-moss-900 sm:text-4xl">
            Какво усещат хората, след като следят сезона
          </h2>
        </RevealOnScroll>

        {reviews.length === 0 ? (
          <RevealOnScroll className="content-after-head block">
            <EmptyState
              title="Все още няма бележки"
              description="Докато хората следят сезона на този фермер, тук ще се появят тихи думи за доверие."
            />
          </RevealOnScroll>
        ) : (
          <div className="content-after-head stack-relaxed">
            <ul className="m-0 list-none space-y-0 p-0">
              {visible.map((review) => (
                <li
                  key={review.id}
                  className="border-t border-loam-400/40 py-10 first:border-t-0 first:pt-0"
                >
                  <blockquote className="editorial-serif max-w-3xl text-2xl leading-relaxed text-moss-900 sm:text-[1.65rem] sm:leading-[1.45]">
                    &ldquo;{review.comment}&rdquo;
                  </blockquote>
                  <footer className="mt-5 text-sm text-soil/75">
                    <cite className="not-italic font-medium text-moss-800">
                      {review.author}
                    </cite>
                    <span className="mx-2 text-loam-400" aria-hidden>
                      ·
                    </span>
                    <time>{review.createdAt}</time>
                  </footer>
                </li>
              ))}
            </ul>

            {reviews.length > featured.length ? (
              <button
                type="button"
                onClick={() => setShowAll((value) => !value)}
                className="story-link cursor-pointer text-left"
              >
                {showAll
                  ? "Покажи по-малко"
                  : `Виж всички бележки (${reviews.length})`}
              </button>
            ) : null}
          </div>
        )}
      </div>
    </PageSection>
  );
}
