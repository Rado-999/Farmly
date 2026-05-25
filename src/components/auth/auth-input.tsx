import type { InputHTMLAttributes } from "react";

type AuthInputProps = {
  id: string;
  label: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function AuthInput({
  id,
  label,
  error,
  className = "",
  ...props
}: AuthInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-stone-700">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-base text-stone-900 shadow-sm transition-[border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] placeholder:text-stone-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:cursor-not-allowed disabled:opacity-60 motion-safe:focus-visible:-translate-y-px ${
          error
            ? "border-red-300 focus-visible:outline-red-500"
            : "border-stone-200 hover:border-stone-300"
        } ${className}`}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} className="text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
