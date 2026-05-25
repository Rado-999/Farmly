type StoryHeadingProps = {
  kicker?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  size?: "section" | "chapter";
  className?: string;
};

export function StoryHeading({
  kicker,
  title,
  description,
  align = "left",
  size = "section",
  className = "",
}: StoryHeadingProps) {
  const alignmentClassName =
    align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl text-left";

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
