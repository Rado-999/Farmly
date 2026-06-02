import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { MediaPanel } from "@/components/ui/media-panel";
import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { RevealStagger } from "@/components/ui/reveal-stagger";
import type { Locale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/translate";
import type { SeasonalProduct } from "@/lib/landing/types";

type SeasonalFoodSectionProps = {
  locale: Locale;
  products: SeasonalProduct[];
};

function harvestScrim(from: string, to: string): string {
  return `linear-gradient(180deg, rgba(20, 28, 18, 0.08) 0%, ${from}bb 52%, ${to}f0 100%)`;
}

function SeasonalProductTile({
  product,
  locale,
}: {
  product: SeasonalProduct;
  locale: Locale;
}) {
  const productHref = product.farmerSlug
    ? `/farmers/${product.farmerSlug}/products/${product.id}`
    : null;

  const body = (
    <>
      <MediaPanel
        from={product.gradientFrom}
        to={product.gradientTo}
        label={product.name}
        imageUrl={product.imageUrl}
        interactive={Boolean(productHref)}
        className="absolute inset-0 h-full w-full transition-transform duration-700 ease-organic motion-safe:group-hover:scale-[1.03]"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundImage: harvestScrim(product.gradientFrom, product.gradientTo) }}
      />
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-1 p-3.5 pb-4 sm:p-4">
        <p className="type-kicker type-kicker-on-dark line-clamp-1">{product.season}</p>
        <h3 className="editorial-serif text-xl leading-tight text-mist sm:text-[1.35rem]">
          {product.name}
        </h3>
        <p className="text-xs leading-5 text-mist/85 sm:text-sm">
          {translate(locale, "От ", "From ")}
          {product.farmerName}
        </p>
        {product.note ? (
          <p className="line-clamp-2 text-xs leading-5 text-mist/75 sm:text-sm">
            {product.note}
          </p>
        ) : null}
        {productHref ? (
          <span className="harvest-tile-link">
            {translate(locale, "Виж от къде идва", "See where it comes from")}
          </span>
        ) : null}
      </div>
    </>
  );

  const tileClassName =
    "group relative isolate block aspect-[3/4] min-h-[14rem] overflow-hidden rounded-sm text-inherit no-underline shadow-[0_14px_36px_-22px_rgba(26,22,16,0.35)] transition-shadow duration-300 hover:shadow-[0_18px_42px_-20px_rgba(47,42,36,0.42)]";

  if (productHref) {
    return (
      <Link href={productHref} className={tileClassName}>
        {body}
      </Link>
    );
  }

  return <article className={tileClassName}>{body}</article>;
}

export function SeasonalFoodSection({
  products,
  locale,
}: SeasonalFoodSectionProps) {
  return (
    <PageSection id="seasonal-food" tone="earth" spacing="default">
      <div className="page-shell-wide">
        <RevealOnScroll>
          <div className="stack-relaxed">
            <p className="type-kicker">
              {translate(locale, "Какво земята предлага сега", "What the land offers now")}
            </p>
            <h2 className="type-chapter max-w-2xl text-loam-900">
              {translate(locale, "Жътвата е момент, не каталог.", "Harvest is a moment, not a catalog.")}
            </h2>
            <p className="max-w-lg text-base leading-8 text-stone-700/90 sm:text-lg sm:leading-9">
              {translate(
                locale,
                "Всяко име по-долу е нещо узряло днес — бележка прехвърлена през оградата, не артикул в количка.",
                "Each name below is something ripe today, a note passed over the fence, not an item in a cart.",
              )}
            </p>
          </div>
        </RevealOnScroll>

        {products.length === 0 ? (
          <RevealOnScroll className="content-after-head block">
            <EmptyState
              title={translate(locale, "Полетата са тихи засега", "The fields are quiet for now")}
              description={translate(
                locale,
                "Когато производителите споделят какво е готово, ще го прочетете тук — без натиск за покупка.",
                "When growers share what is ready, you will find it here without pressure to buy.",
              )}
            />
          </RevealOnScroll>
        ) : (
          <RevealStagger className="content-after-head grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <SeasonalProductTile
                key={product.id}
                product={product}
                locale={locale}
              />
            ))}
          </RevealStagger>
        )}
      </div>
    </PageSection>
  );
}
