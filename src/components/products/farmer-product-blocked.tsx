import Link from "next/link";

type FarmerProductBlockedProps = {
  reason: "not_farmer" | "incomplete_profile";
  href: string;
  label: string;
};

const messages: Record<FarmerProductBlockedProps["reason"], string> = {
  incomplete_profile: "Попълнете профила си, за да добавяте продукти.",
  not_farmer: "Трябва да сте фермер, за да управлявате продукти.",
};

export function FarmerProductBlocked({
  reason,
  href,
  label,
}: FarmerProductBlockedProps) {
  return (
    <div className="page-shell max-w-lg page-y text-center">
      <p className="text-base text-stone-700">{messages[reason]}</p>
      <Link
        href={href}
        className="mt-6 inline-flex rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white"
      >
        {label}
      </Link>
    </div>
  );
}
