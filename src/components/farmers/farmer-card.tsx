import Link from "next/link";

import { FarmerCardAvatar } from "@/components/farmers/farmer-card-avatar";

type FarmerCardProps = {
  href: string;
  name: string;
  location: string;
  description: string;
  imageUrl?: string | null;
  gradientFrom: string;
  gradientTo: string;
  linkLabel: string;
  /** Short line under the name, e.g. specialty or philosophy */
  highlight?: string;
  surface?: "cream" | "white";
};

export function FarmerCard({
  href,
  name,
  location,
  description,
  imageUrl,
  gradientFrom,
  gradientTo,
  linkLabel,
  highlight,
  surface = "cream",
}: FarmerCardProps) {
  const surfaceClassName =
    surface === "white" ? "bg-white" : "bg-cream";

  return (
    <Link
      href={href}
      className={`clickable-card surface-card group flex h-full min-h-0 flex-col shadow-none ${surfaceClassName}`}
    >
      <div className="flex shrink-0 justify-center px-6 pb-2 pt-7 sm:pt-8">
        <FarmerCardAvatar
          name={name}
          imageUrl={imageUrl}
          gradientFrom={gradientFrom}
          gradientTo={gradientTo}
          surface={surface}
        />
      </div>

      <div className="flex flex-col card-pad pt-4 text-center">
        <div className="stack-tight">
          <div>
            <p className="text-sm text-stone-500">{location}</p>
            <h3 className="mt-1 text-xl font-semibold text-stone-900 transition-colors duration-500 group-hover:text-forest">
              {name}
            </h3>
          </div>

          {highlight ? (
            <p className="text-sm font-medium text-forest">{highlight}</p>
          ) : null}

          {description ? (
            <p className="line-clamp-3 text-base leading-7 text-stone-600 transition-colors duration-500 group-hover:text-stone-700">
              {description}
            </p>
          ) : null}
        </div>

        <span className="text-link mx-auto mt-3 self-center sm:mt-4">
          {linkLabel}
        </span>
      </div>
    </Link>
  );
}
