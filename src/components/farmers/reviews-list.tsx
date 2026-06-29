import { EmptyState } from "@/components/ui/empty-state";
import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { RevealStagger } from "@/components/ui/reveal-stagger";
import { SectionHeading } from "@/components/ui/section-heading";
import type { FarmerReview } from "@/lib/farmers/types";

type ReviewsListProps = {
  reviews: FarmerReview[];
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div
      aria-label={`${rating} от 5 звезди`}
      className="flex gap-1 text-amber-700"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} aria-hidden>
          {index < rating ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}

export function ReviewsList({ reviews }: ReviewsListProps) {
  return (
    <PageSection tone="cream" id="reviews">
      <div className="page-shell">
        <RevealOnScroll>
          <SectionHeading
            align="left"
            eyebrow="Доверие от общността"
            title="Какво казват хората, след като опознаят фермата"
            description="Няколко честни бележки имат по-голямо значение от стена от оценки."
          />
        </RevealOnScroll>

        {reviews.length === 0 ? (
          <RevealOnScroll className="content-after-head block">
            <EmptyState
              title="Все още няма отзиви"
              description="Когато хора добавят този фермер в селото си, тук ще се появят бележки за доверие."
            />
          </RevealOnScroll>
        ) : (
          <RevealStagger className="content-after-head grid-cards lg:grid-cols-2">
            {reviews.map((review) => (
              <li
                key={review.id}
                className="surface-card flex h-full list-none flex-col card-pad"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-stone-900">{review.author}</p>
                    <p className="text-sm text-stone-500">{review.createdAt}</p>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <p className="mt-4 text-base leading-7 text-stone-600 sm:leading-8">
                  {review.comment}
                </p>
              </li>
            ))}
          </RevealStagger>
        )}
      </div>
    </PageSection>
  );
}
