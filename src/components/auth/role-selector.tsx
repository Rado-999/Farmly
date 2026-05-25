import type { UserRole } from "@/lib/auth/types";

type RoleSelectorProps = {
  name: string;
  value: UserRole;
  onChange: (role: UserRole) => void;
  error?: string;
};

const options: { value: UserRole; label: string; description: string }[] = [
  {
    value: "buyer",
    label: "Купувач",
    description: "Откривай местна храна и следвай производители, на които се доверяваш.",
  },
  {
    value: "farmer",
    label: "Фермер",
    description: "Споделяй историята на фермата си и се свържи с близки купувачи.",
  },
];

export function RoleSelector({ name, value, onChange, error }: RoleSelectorProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-stone-700">
        Присъединявам се като
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = value === option.value;

          return (
            <label
              key={option.value}
              className={`flex h-full cursor-pointer flex-col rounded-2xl border px-4 py-4 transition-[border-color,background-color,box-shadow] duration-300 ${
                isSelected
                  ? "border-forest/40 bg-forest/5 shadow-[0_12px_28px_-18px_rgba(63,90,58,0.35)]"
                  : "border-stone-200 bg-white hover:border-stone-300"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span className="block text-sm font-semibold text-stone-900">
                {option.label}
              </span>
              <span className="mt-1 block text-sm leading-6 text-stone-600">
                {option.description}
              </span>
            </label>
          );
        })}
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </fieldset>
  );
}
