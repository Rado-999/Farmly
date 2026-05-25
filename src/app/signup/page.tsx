import type { Metadata } from "next";

import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Създай акаунт | Farmly",
  description:
    "Създайте акаунт в Farmly, за да откривате местна храна и по желание да станете фермер по-късно.",
};

export default function SignupPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 page-y">
      <SignupForm />
    </main>
  );
}
