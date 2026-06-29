import Link from "next/link";

import { MediaPanel } from "@/components/ui/media-panel";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import type { FarmerProduct } from "@/lib/farmers/types";

type SeasonalOfferingsProps = {
  farmerSlug: string;
  products: FarmerProduct[];
};

const MAX_OFFERINGS = 6;

export function SeasonalOfferings({
  farmerSlug,
  products,
}: SeasonalOfferingsProps) {
  const offerings = products.slice(0, MAX_OFFERINGS);

  return (
    <PageSection id="offerings" tone="parchment" spacing="default">
      <div className="page-shell">
        <RevealOnScroll>
          <p className="text-[0.8125rem] font-medium tracking-[0.14em] text-clay uppercase">
            От тази ферма сега
          </p>
          <h2 className="editorial-serif mt-3 max-w-2xl text-3xl leading-tight text-moss-900 sm:text-4xl">
            Какво предлага земята в момента
          </h2>
          <p className="mt-4 max-w-xl text-base leading-8 text-soil/80">
            Продукти, които фермерът споделя като готови сега.
          </p>
        </RevealOnScroll>

        {offerings.length === 0 ? (
          <RevealOnScroll className="content-after-head block">
            <EmptyState
              title="Земята почива"
              description="Продуктите се появяват, когато фермерът е готов да сподели какво носи сезонът."
            />
          </RevealOnScroll>
        ) : (
          <ul className="content-after-head m-0 list-none divide-y divide-loam-300/50 p-0">
            {offerings.map((product) => (
              <li key={product.id}>
                <RevealOnScroll>
                  <Link
                    href={`/farmers/${farmerSlug}/products/${product.id}`}
                    className="group grid gap-6 py-9 sm:grid-cols-[minmax(0,1fr)_7.5rem] sm:items-center sm:gap-10"
                  >
                    <div className="min-w-0 stack-tight">
                      <p className="text-[0.6875rem] font-medium tracking-[0.14em] text-clay uppercase">
                        {product.availability}
                      </p>
                      <h3 className="editorial-serif text-2xl text-moss-900 sm:text-3xl">
                        {product.title}
                      </h3>
                      {product.description ? (
                        <p className="max-w-lg line-clamp-2 text-sm leading-7 text-soil/80 sm:text-base sm:leading-8">
                          {product.description}
                        </p>
                      ) : null}
                      <span className="story-link mt-1">Виж историята</span>
                      <p className="mt-3 text-sm text-soil/60">{product.price}</p>
                    </div>

                    <MediaPanel
                      from={product.gradientFrom}
                      to={product.gradientTo}
                      label={product.title}
                      imageUrl={product.imageUrl}
                      className="aspect-square w-full max-w-[7.5rem] shrink-0 justify-self-end rounded-sm sm:max-h-32"
                    />
                  </Link>
                </RevealOnScroll>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageSection>
  );
}
