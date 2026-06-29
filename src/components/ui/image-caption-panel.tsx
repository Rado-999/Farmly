type ImageCaptionPanelProps = {
  children: React.ReactNode;
  className?: string;
  textClassName?: string;
};

export function ImageCaptionPanel({
  children,
  className = "",
  textClassName = "editorial-serif text-xl leading-snug sm:text-2xl",
}: ImageCaptionPanelProps) {
  return (
    <figcaption className={`image-caption-fusion absolute inset-x-0 bottom-0 ${className}`}>
      <div aria-hidden className="image-caption-fusion__scrim" />
      <p className={`image-caption-fusion__text ${textClassName}`}>{children}</p>
    </figcaption>
  );
}
