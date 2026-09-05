import Link from "next/link";

export function FormFrame({
  mode,
  children,
}: {
  mode: "login" | "register";
  children: React.ReactNode;
}) {
  const login = mode === "login";
  return (
    <div
      className={`w-full min-w-0 ${login ? "space-y-6 md:space-y-7" : "space-y-4 md:space-y-[18px]"}`}
    >
      <header
        className={login ? "text-center md:pb-2 md:text-left" : "text-left"}
      >
        <h2
          className={`font-bold leading-[1.15] tracking-[-.035em] text-ink ${login ? "flex items-center justify-center gap-3 text-[34px] md:justify-start md:text-[37px]" : "text-[28px] md:text-[30px]"}`}
        >
          {login ? "Welcome back" : "Create your account"}
        </h2>
        <p
          className={`mt-2 leading-normal text-muted ${login ? "text-[15px] md:whitespace-nowrap md:text-[15.5px]" : "max-w-[300px] text-[13px]"}`}
        >
          {login
            ? "Sign in to continue your journey on Bandhanaa."
            : "Join Bandhanaa and begin your journey toward something meaningful."}
        </p>
      </header>
      {children}
      {!login && (
        <>
          <div
            className="flex items-center gap-5 text-xs text-muted"
            aria-label="or"
          >
            <span className="h-px flex-1 bg-line" />
            <span>or</span>
            <span className="h-px flex-1 bg-line" />
          </div>
          <p className="text-center text-[13px] text-muted">
            Already have an account?{" "}
            <Link className="text-accent hover:text-[#8144b5]" href="/login">
              Sign in
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
