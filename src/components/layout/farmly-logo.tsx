import Image from "next/image";
import Link from "next/link";

const LOGO_WIDTH = 454;
const LOGO_HEIGHT = 525;

type FarmlyLogoProps = {
  className?: string;
  href?: string | null;
  priority?: boolean;
};

export function FarmlyLogo({
  className = "h-[3.75rem] w-auto sm:h-[4.125rem]",
  href = "/",
  priority = false,
}: FarmlyLogoProps) {
  const image = (
    <Image
      src="/brand/farmly-logo.png"
      alt="Farmly"
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      priority={priority}
      className={`object-contain ${className}`}
    />
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex shrink-0 transition-opacity duration-300 hover:opacity-85"
        aria-label="Farmly"
      >
        {image}
      </Link>
    );
  }

  return image;
}
