type EmptyStateProps = {
  title: string;
  description: string;
  className?: string;
};

export function EmptyState({ title, description, className = "" }: EmptyStateProps) {
  return (
    <div className={`empty-state ${className}`}>
      <div
        aria-hidden
        className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-forest/8 text-forest"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
          <path
            d="M12 3.5c-3.2 0-5.8 2.4-5.8 5.4 0 2.1 1.1 3.9 2.8 4.9L12 21l3-7.2c1.7-1 2.8-2.8 2.8-4.9 0-3-2.6-5.4-5.8-5.4Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="text-base font-medium text-stone-900">{title}</p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-600">
        {description}
      </p>
    </div>
  );
}
