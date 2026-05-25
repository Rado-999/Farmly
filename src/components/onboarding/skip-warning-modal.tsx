type SkipWarningModalProps = {
  isOpen: boolean;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function SkipWarningModal({
  isOpen,
  isLoading = false,
  onCancel,
  onConfirm,
}: SkipWarningModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-stone-900/35 p-4 backdrop-blur-sm sm:items-center"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="skip-onboarding-title"
        className="w-full max-w-md animate-[fade-up_0.35s_ease-out] rounded-[1.75rem] border border-stone-200/90 bg-cream p-6 shadow-[0_28px_60px_-24px_rgba(47,42,36,0.45)] sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-forest">
          Преди да тръгнете
        </p>
        <h2
          id="skip-onboarding-title"
          className="mt-2 text-xl font-semibold text-stone-900"
        >
          Да пропуснете настройката на профила?
        </h2>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Профилът ви няма да е напълно видим за другите и това може да намали
          доверието. Винаги можете да довършите по-късно от акаунта си.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="inline-flex justify-center rounded-full border border-stone-300/90 bg-white px-5 py-2.5 text-sm font-medium text-stone-800 transition-colors hover:border-forest/35 hover:text-forest disabled:opacity-60"
          >
            Продължи
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex justify-center rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:bg-stone-800 disabled:opacity-60"
          >
            {isLoading ? "Пропускане..." : "Пропусни засега"}
          </button>
        </div>
      </div>
    </div>
  );
}
