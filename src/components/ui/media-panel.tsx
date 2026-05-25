import Image from "next/image";

type ImageFit = "cover" | "contain";

type MediaPanelProps = {
  from: string;
  to: string;
  label: string;
  className?: string;
  overlay?: React.ReactNode;
  imageUrl?: string | null;
  interactive?: boolean;
  /** Use "contain" for portraits/avatars so faces are never cropped. */
  fit?: ImageFit;
};

export function MediaPanel({
  from,
  to,
  label,
  className = "",
  overlay,
  imageUrl,
  interactive = false,
  fit = "cover",
}: MediaPanelProps) {
  const isPortraitFit = fit === "contain";
  const imageFitClassName = isPortraitFit
    ? "object-contain object-center"
    : `object-cover ${interactive ? "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:scale-[1.04]" : ""}`;

  return (
    <div
      className={`relative overflow-hidden rounded-sm shadow-sm ${className}`}
      style={{
        backgroundImage: `linear-gradient(135deg, ${from}, ${to})`,
      }}
    >
      <span className="sr-only">{label}</span>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={label}
          fill
          className={imageFitClassName}
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),transparent_55%)]"
        />
      )}
      {overlay}
    </div>
  );
}
