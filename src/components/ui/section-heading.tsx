type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: SectionHeadingProps) {
  const alignmentClassName =
    align === "center" ? "mx-auto text-center" : "text-left";

  return (
    <div className={`stack-heading max-w-2xl ${alignmentClassName}`}>
      <p className="type-kicker text-forest">
        {eyebrow}
      </p>
      <h2 className="type-chapter text-loam-900">
        {title}
      </h2>
      {description ? (
        <p className="type-body text-loam-600">
          {description}
        </p>
      ) : null}
    </div>
  );
}
