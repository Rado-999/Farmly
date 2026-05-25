type OnboardingTextareaProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
};

export function OnboardingTextarea({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  hint,
}: OnboardingTextareaProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-stone-700">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-y rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-base text-stone-900 shadow-sm transition-[border-color,box-shadow] duration-300 placeholder:text-stone-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
      />
      {hint ? <p className="text-sm text-stone-500">{hint}</p> : null}
    </div>
  );
}
