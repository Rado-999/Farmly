import type { SelectHTMLAttributes } from "react";

/** Chevron inset from the right edge so the arrow is not flush against the border. */
export const formSelectClassName =
  "w-full cursor-pointer appearance-none rounded-2xl border border-stone-200/90 bg-white bg-[length:1rem] bg-[position:right_1rem_center] bg-no-repeat py-3 pl-4 pr-11 text-base text-stone-900 shadow-sm transition-[border-color] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest [background-image:url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2716%27 height=%2716%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%2378716c%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E')]";

type FormSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  label: string;
};

export function FormSelect({
  id,
  label,
  className = "",
  children,
  ...props
}: FormSelectProps) {
  return (
    <label htmlFor={id} className="stack-tight text-sm">
      <span className="font-medium text-stone-700">{label}</span>
      <select id={id} className={`${formSelectClassName} ${className}`} {...props}>
        {children}
      </select>
    </label>
  );
}
