import type { ButtonHTMLAttributes } from "react";

type AuthButtonProps = {
  isLoading?: boolean;
  loadingLabel?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function AuthButton({
  children,
  isLoading = false,
  loadingLabel = "Please wait",
  className = "",
  disabled,
  ...props
}: AuthButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest px-5 py-3.5 text-base font-medium text-cream shadow-[0_14px_30px_-18px_rgba(63,90,58,0.52)] transition-[background-color,box-shadow,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#2a4227] hover:shadow-[0_20px_42px_-12px_rgba(42,66,39,0.62)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:cursor-not-allowed disabled:opacity-70 motion-safe:active:scale-[0.985] motion-safe:active:duration-150 ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <span
            aria-hidden
            className="h-4 w-4 animate-spin rounded-full border-2 border-cream/30 border-t-cream"
          />
          <span>{loadingLabel}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
