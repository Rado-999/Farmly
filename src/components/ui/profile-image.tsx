type ProfileImageProps = {
  src: string;
  alt: string;
  className?: string;
  shape?: "circle" | "squircle";
  /** When true, alt may be empty and the image is decorative. */
  decorative?: boolean;
};

const shapeClassNames = {
  circle: "rounded-full",
  squircle: "rounded-[1.5rem]",
};

/**
 * Square-cropped avatars fill the frame edge to edge.
 */
export function ProfileImage({
  src,
  alt,
  className = "",
  shape = "squircle",
  decorative = false,
}: ProfileImageProps) {
  return (
    <div
      aria-hidden={decorative || undefined}
      className={`overflow-hidden bg-stone-200 ${shapeClassNames[shape]} ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- user-specific external URLs */}
      <img
        src={src}
        alt={decorative ? "" : alt}
        className="h-full w-full object-cover object-center"
      />
    </div>
  );
}
