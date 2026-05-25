import { formatExperienceYears } from "@/lib/data/formatters";

type FarmerMetaProps = {
  location: string;
  experienceYears: number | null;
};

export function FarmerMeta({ location, experienceYears }: FarmerMetaProps) {
  const experienceLabel = formatExperienceYears(experienceYears);

  return (
    <ul className="flex flex-wrap items-center gap-2.5 text-sm text-stone-600">
      <li className="inline-flex items-center gap-2 rounded-full border border-stone-200/80 bg-white/80 px-3.5 py-1.5 shadow-sm backdrop-blur-sm">
        <span aria-hidden className="text-forest">
          ◎
        </span>
        <span>{location}</span>
      </li>
      {experienceLabel ? (
        <li className="inline-flex items-center gap-2 rounded-full border border-stone-200/80 bg-white/80 px-3.5 py-1.5 shadow-sm backdrop-blur-sm">
          <span aria-hidden className="text-forest">
            ✦
          </span>
          <span>{experienceLabel}</span>
        </li>
      ) : null}
    </ul>
  );
}
