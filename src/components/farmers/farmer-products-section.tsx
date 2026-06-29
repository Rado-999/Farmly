import { ProductCard } from "@/components/farmers/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSection } from "@/components/ui/page-section";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { SectionHeading } from "@/components/ui/section-heading";
import type { FarmerProduct, FarmerVideo } from "@/lib/farmers/types";

type FarmerProductsSectionProps = {
  farmerSlug: string;
  products: FarmerProduct[];
  videos: FarmerVideo[];
};

export function FarmerProductsSection({
  farmerSlug,
  products,
  videos,
}: FarmerProductsSectionProps) {
  const videosById = new Map(videos.map((video) => [video.id, video]));

  return (
    <PageSection tone="white" id="products">
      <div className="page-shell">
        <RevealOnScroll>
          <SectionHeading
            align="left"
            eyebrow="Сезонни продукти"
            title="Какво предлага земята сега"
            description="Продукти, които фермерът споделя като готови сега."
          />
        </RevealOnScroll>

        {products.length === 0 ? (
          <RevealOnScroll className="content-after-head block">
            <EmptyState
              title="Все още няма споделени продукти"
              description="Продуктите се появяват, когато фермерът е готов да сподели какво предлага сезонът."
            />
          </RevealOnScroll>
        ) : (
          <ul className="content-after-head m-0 w-full list-none space-y-0 p-0">
            {products.map((product) => (
              <li key={product.id}>
                <RevealOnScroll>
                  <ProductCard
                    farmerSlug={farmerSlug}
                    product={product}
                    relatedVideos={product.relatedVideoIds
                      .map((videoId) => videosById.get(videoId))
                      .filter((video): video is FarmerVideo => Boolean(video))}
                  />
                </RevealOnScroll>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageSection>
  );
}
