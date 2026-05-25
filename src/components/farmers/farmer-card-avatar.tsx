import { getProfileInitials } from "@/lib/auth/profile";

const sizeClassNames = {
  md: "h-28 w-28 rounded-[1.25rem] text-2xl",
  lg: "h-20 w-20 rounded-full text-lg sm:h-24 sm:w-24",
};

const surfaceBackdropClassNames = {
  cream: "bg-cream",
  white: "bg-white",
} as const;

type FarmerCardAvatarProps = {
  name: string;
  imageUrl?: string | null;
  gradientFrom: string;
  gradientTo: string;
  size?: keyof typeof sizeClassNames;
  surface?: keyof typeof surfaceBackdropClassNames;
};

export function FarmerCardAvatar({
  name,
  imageUrl,
  gradientFrom,
  gradientTo,
  size = "md",
  surface = "cream",
}: FarmerCardAvatarProps) {
  const sizeClassName = sizeClassNames[size];
  const backdropClassName = surfaceBackdropClassNames[surface];

  if (imageUrl) {
    return (
      <div
        className={`shrink-0 overflow-hidden ring-1 ring-stone-200/70 ${backdropClassName} ${sizeClassName}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- farmer avatar URL */}
        <img
          src={imageUrl}
          alt={`${name} profile`}
          className="h-full w-full object-cover object-center"
        />
      </div>
    );
  }

  const initials = getProfileInitials(name);

  return (
    <div
      aria-hidden
      className={`flex shrink-0 items-center justify-center font-semibold text-mist ring-1 ring-stone-200/70 ${sizeClassName}`}
      style={{
        backgroundImage: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
      }}
    >
      {initials}
    </div>
  );
}
