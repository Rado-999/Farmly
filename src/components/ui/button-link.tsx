import Link from "next/link";

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "quiet";
  className?: string;
};

const variantClassNames = {
  primary:
    "rounded-full border border-forest/20 bg-forest px-6 py-3 text-sm font-medium text-mist shadow-[0_16px_36px_-20px_rgba(31,48,34,0.55)] transition-[background-color,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-forest-deep hover:shadow-[0_20px_44px_-16px_rgba(31,48,34,0.5)] focus-visible:outline-forest",
  secondary:
    "rounded-full border border-stone-400/40 bg-mist/80 px-6 py-3 text-sm font-medium text-forest-deep backdrop-blur-sm transition-[background-color,border-color,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-forest/35 hover:bg-white/90 focus-visible:outline-stone-500",
  quiet:
    "story-link px-0 py-0 text-forest-deep hover:text-forest-deep",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonLinkProps) {
  if (variant === "quiet") {
    return (
      <Link href={href} className={`story-link cursor-pointer ${className}`}>
        {children}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`inline-flex cursor-pointer items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:active:scale-[0.99] motion-safe:active:duration-200 ${variantClassNames[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
