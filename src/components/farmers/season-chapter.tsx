import Link from "next/link";

import { MediaPanel } from "@/components/ui/media-panel";
import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { RevealStagger } from "@/components/ui/reveal-stagger";
import { formatVideoStage } from "@/lib/data/formatters";
import {
  getCurrentSeasonLabel,
  getFeaturedVideo,
  pickSeasonProducts,
} from "@/lib/farmers/profile-helpers";
import type { FarmerProfile } from "@/lib/farmers/types";

type SeasonChapterProps = {
  farmer: Pick<
    FarmerProfile,
    "id" | "name" | "products" | "videos" | "region"
  >;
};

export function SeasonChapter({ farmer }: SeasonChapterProps) {
  const seasonLabel = getCurrentSeasonLabel(farmer);
  const featuredVideo = getFeaturedVideo(farmer.videos);
  const seasonProducts = pickSeasonProducts(farmer.products, 3);

  if (!seasonLabel && !featuredVideo && seasonProducts.length === 0) {
    return null;
  }

  return (
    <PageSection id="season" tone="dawn" spacing="default">
      <div className="page-shell">
        <RevealOnScroll>
          <p className="text-[0.8125rem] font-medium tracking-[0.14em] text-clay uppercase">
            Сезонен поглед
          </p>
          <h2 className="editorial-serif mt-3 max-w-2xl text-3xl leading-tight text-moss-900 sm:text-4xl">
            {seasonLabel ?? "Този месец на фермата"}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-8 text-soil/85">
            Какво {farmer.name} отглежда и споделя в момента.
          </p>
        </RevealOnScroll>

        <div className="content-after-head layout-split grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-start lg:gap-14">
          {featuredVideo ? (
            <RevealOnScroll>
              <div>
                <h3 className="text-sm font-medium text-moss-800">
                  Този месец на фермата
                </h3>
                <Link
                  href="#featured-film"
                  className="clickable-card group mt-4 block"
                >
                  <MediaPanel
                    from={featuredVideo.gradientFrom}
                    to={featuredVideo.gradientTo}
                    label={featuredVideo.title}
                    imageUrl={featuredVideo.imageUrl}
                    className="aspect-video w-full rounded-sm"
                  />
                  <p className="editorial-serif mt-4 text-xl text-moss-900 group-hover:text-moss-700">
                    {featuredVideo.title}
                  </p>
                  <p className="mt-1 text-sm text-soil/70">
                    {formatVideoStage(featuredVideo.stage)} ·{" "}
                    <span className="story-link">Гледай отново</span>
                  </p>
                </Link>
              </div>
            </RevealOnScroll>
          ) : null}

          {seasonProducts.length > 0 ? (
            <RevealStagger className="stack-relaxed">
              <h3 className="text-sm font-medium text-moss-800">
                На масата сега
              </h3>
              <ul className="m-0 list-none space-y-0 p-0">
                {seasonProducts.map((product) => (
                  <li
                    key={product.id}
                    className="border-t border-loam-400/35 py-5 first:border-t-0 first:pt-0"
                  >
                    <Link
                      href={`/farmers/${farmer.id}/products/${product.id}`}
                      className="group block"
                    >
                      <p className="text-[0.6875rem] font-medium tracking-[0.14em] text-clay uppercase">
                        {product.availability}
                      </p>
                      <p className="editorial-serif mt-1 text-2xl text-moss-900">
                        {product.title}
                      </p>
                      {product.description ? (
                        <p className="mt-2 line-clamp-2 text-sm leading-7 text-soil/80">
                          {product.description}
                        </p>
                      ) : null}
                      <span className="story-link mt-2">Виж историята</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </RevealStagger>
          ) : null}
        </div>
      </div>
    </PageSection>
  );
}
