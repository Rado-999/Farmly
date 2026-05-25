import { ProfileImage } from "@/components/ui/profile-image";
import { getProfileInitials } from "@/lib/auth/profile";

type UserAvatarProps = {
  name: string;
  avatarUrl?: string | null;
  size?: "md" | "lg";
};

const sizeClassNames = {
  md: "h-16 w-16 text-base",
  lg: "h-24 w-24 text-xl sm:h-28 sm:w-28 sm:text-2xl",
};

export function UserAvatar({
  name,
  avatarUrl,
  size = "lg",
}: UserAvatarProps) {
  const initials = getProfileInitials(name);
  const sizeClassName = sizeClassNames[size];

  if (avatarUrl) {
    return (
      <ProfileImage
        src={avatarUrl}
        alt={`${name} avatar`}
        className={`border-[4px] border-cream shadow-[0_24px_52px_-22px_rgba(47,42,36,0.35)] ${sizeClassName}`}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={`inline-flex items-center justify-center rounded-[1.5rem] border-[4px] border-cream bg-[linear-gradient(135deg,#d9e2cf_0%,#8a9a7b_100%)] font-semibold text-forest shadow-[0_24px_52px_-22px_rgba(47,42,36,0.35)] ${sizeClassName}`}
    >
      {initials}
    </div>
  );
}
