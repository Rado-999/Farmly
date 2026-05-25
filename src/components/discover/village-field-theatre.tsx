import { FarmerStoriesContent } from "@/components/landing/farmer-stories-content";
import { PageSection } from "@/components/ui/page-section";
import type { VillageFilm } from "@/lib/discover/types";
import type { FarmerStory } from "@/lib/landing/types";

type VillageFieldTheatreProps = {
  films: VillageFilm[];
};

function filmToStory(film: VillageFilm): FarmerStory {
  return {
    id: film.id,
    title: film.title,
    farmerName: film.farmerName,
    location: film.location,
    duration: film.duration,
    description: film.description,
    videoUrl: film.videoUrl,
    imageUrl: film.imageUrl,
    gradientFrom: film.gradientFrom,
    gradientTo: film.gradientTo,
  };
}

export function VillageFieldTheatre({ films }: VillageFieldTheatreProps) {
  const stories = films.map(filmToStory);

  return (
    <PageSection id="field-theatre" tone="earth" spacing="default">
      <div className="page-shell-wide section-stack">
        <FarmerStoriesContent stories={stories} />
      </div>
    </PageSection>
  );
}
