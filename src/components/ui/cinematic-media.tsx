import Image from "next/image";

type CinematicMediaProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  overlay?: React.ReactNode;
  /** 0–100, darkness of bottom vignette */
  vignette?: "light" | "deep";
};

export function CinematicMedia({
  src,
  alt,
  className = "",
  priority = false,
  overlay,
  vignette = "deep",
}: CinematicMediaProps) {
  const veilClassName =
    vignette === "deep" ? "cinematic-veil" : "cinematic-veil-light";

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="object-cover motion-safe:animate-[slow-drift_28s_ease-in-out_infinite]"
        sizes="100vw"
      />
      <div aria-hidden className={veilClassName} />
      <div aria-hidden className="film-grain" />
      {overlay}
    </div>
  );
}
