type StoryHeadingProps = {
  kicker?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  size?: "section" | "chapter";
  maxWidth?: "2xl" | "3xl";
  className?: string;
};

export function StoryHeading({
  kicker,
  title,
  description,
  align = "left",
  size = "section",
  maxWidth = "2xl",
  className = "",
}: StoryHeadingProps) {
  const maxWidthClassName = maxWidth === "3xl" ? "max-w-3xl" : "max-w-2xl";
  const alignmentClassName =
    align === "center"
      ? `mx-auto ${maxWidthClassName} text-center`
      : `${maxWidthClassName} text-left`;

  const titleClassName =
    size === "chapter"
      ? "text-4xl leading-[1.12] text-forest-deep sm:text-5xl lg:text-[3.25rem]"
      : "text-3xl leading-tight text-forest-deep sm:text-4xl";

  return (
    <div className={`stack-heading ${alignmentClassName} ${className}`.trim()}>
      {kicker ? (
        <p className="text-[0.8125rem] font-medium tracking-[0.12em] text-soil uppercase">
          {kicker}
        </p>
      ) : null}
      <h2 className={`editorial-serif font-medium ${titleClassName}`}>{title}</h2>
      {description ? (
        <p className="type-body text-loam-700">
          {description}
        </p>
      ) : null}
    </div>
  );
}
