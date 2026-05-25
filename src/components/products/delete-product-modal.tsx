"use client";

type DeleteProductModalProps = {
  isOpen: boolean;
  productTitle: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteProductModal({
  isOpen,
  productTitle,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteProductModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Затвори"
        className="absolute inset-0 cursor-pointer bg-stone-900/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-[1.5rem] border border-stone-200/80 bg-white p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-stone-900">Изтрий продукта</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Сигурни ли сте, че искате да изтриете &bdquo;{productTitle}&ldquo;?
          Свързаните
          отзиви също ще бъдат премахнати. Това действие не може да бъде
          отменено.
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="cursor-pointer rounded-full border border-stone-300/90 px-4 py-2 text-sm font-medium text-stone-800"
          >
            Отказ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="cursor-pointer rounded-full bg-red-700 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Изтриване..." : "Изтрий"}
          </button>
        </div>
      </div>
    </div>
  );
}
