type GradientPanelProps = {
  from: string;
  to: string;
  label: string;
  className?: string;
  overlay?: React.ReactNode;
};

export function GradientPanel({
  from,
  to,
  label,
  className = "",
  overlay,
}: GradientPanelProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-[1.75rem] shadow-[0_20px_44px_-26px_rgba(47,42,36,0.28)] ${className}`}
      style={{
        backgroundImage: `linear-gradient(135deg, ${from}, ${to})`,
      }}
    >
      <span className="sr-only">{label}</span>
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),transparent_55%)]"
      />
      {overlay}
    </div>
  );
}
