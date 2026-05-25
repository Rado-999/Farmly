export type UserRole = "buyer" | "farmer";

export type LoginFormValues = {
  email: string;
  password: string;
};

export type SignupFormValues = {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
};

export type AuthFieldErrors<T extends string> = Partial<Record<T, string>>;
