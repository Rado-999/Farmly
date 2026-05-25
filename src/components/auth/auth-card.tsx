type AuthCardProps = {
  title: string;
  message: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthCard({ title, message, children, footer }: AuthCardProps) {
  return (
    <div className="w-full max-w-md animate-[fade-up_0.45s_ease-out] rounded-[1.75rem] border border-stone-200/80 bg-white/92 card-pad shadow-[0_22px_52px_-28px_rgba(63,90,58,0.42)] backdrop-blur-sm">
      <div className="stack-tight text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          {title}
        </h1>
        <p className="text-sm leading-6 text-stone-600">{message}</p>
      </div>

      <div className="mt-8 stack">{children}</div>

      {footer ? (
        <div className="mt-6 border-t border-stone-200/80 pt-6 text-center text-sm text-stone-600">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
