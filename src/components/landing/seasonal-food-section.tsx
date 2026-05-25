import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import type { SeasonalProduct } from "@/lib/landing/types";

type SeasonalFoodSectionProps = {
  products: SeasonalProduct[];
};

export function SeasonalFoodSection({ products }: SeasonalFoodSectionProps) {
  return (
    <PageSection id="seasonal-food" tone="earth" spacing="default">
      <div className="page-shell-wide">
        <RevealOnScroll>
          <div className="stack-relaxed">
            <p className="type-kicker">Какво земята предлага сега</p>
            <h2 className="type-chapter max-w-2xl text-loam-900">
              Жътвата е момент, не каталог.
            </h2>
            <p className="max-w-lg text-base leading-8 text-stone-700/90 sm:text-lg sm:leading-9">
              Всяко име по-долу е нещо узряло днес — бележка прехвърлена през
              оградата, не артикул в количка.
            </p>
          </div>
        </RevealOnScroll>

        {products.length === 0 ? (
          <RevealOnScroll className="content-after-head block">
            <EmptyState
              title="Полетата са тихи засега"
              description="Когато производителите споделят какво е готово, ще го прочетете тук — без натиск за покупка."
            />
          </RevealOnScroll>
        ) : (
          <ul className="content-after-head m-0 list-none space-y-0 p-0">
            {products.map((product, index) => {
              const productHref = product.farmerSlug
                ? `/farmers/${product.farmerSlug}/products/${product.id}`
                : null;
              const farmerHref = product.farmerSlug
                ? `/farmers/${product.farmerSlug}`
                : null;

              const rowContent = (
                <>
                  <div className="flex items-baseline gap-4 sm:gap-6">
                    <span
                      aria-hidden
                      className="editorial-serif text-3xl leading-none text-forest/20 sm:text-4xl"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 stack-tight">
                      <p className="text-sm font-medium tracking-wide text-clay">
                        {product.season}
                      </p>
                      <h3 className="editorial-serif text-2xl text-forest-deep sm:text-3xl">
                        {product.name}
                      </h3>
                      <p className="text-sm text-soil">
                        Отглеждано от{" "}
                        {farmerHref ? (
                          <Link
                            href={farmerHref}
                            className="story-link story-link--no-arrow align-baseline text-sm text-soil"
                          >
                            {product.farmerName}
                          </Link>
                        ) : (
                          product.farmerName
                        )}
                      </p>
                      {product.note ? (
                        <p className="max-w-lg text-sm leading-7 text-stone-700/90 sm:text-base sm:leading-8">
                          {product.note}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  {productHref ? (
                    <Link href={productHref} className="story-link hidden shrink-0 sm:inline-flex">
                      Виж от къде идва
                    </Link>
                  ) : null}
                </>
              );

              return (
                <li key={product.id} className="border-t border-stone-300/40">
                  <RevealOnScroll>
                    <article className="flex items-start justify-between gap-6 py-8 sm:py-10">
                      {rowContent}
                    </article>
                  </RevealOnScroll>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </PageSection>
  );
}
