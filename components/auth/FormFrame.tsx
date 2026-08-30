import Link from "next/link";

function ShieldIcon() { return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 3 5.5 5.8v5.6c0 4.3 2.7 7.7 6.5 9.6 3.8-1.9 6.5-5.3 6.5-9.6V5.8L12 3Z" stroke="currentColor" strokeWidth="1.5"/><path d="m9.3 12 1.8 1.8 3.7-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>; }

export function FormFrame({ mode, children }: { mode: "login" | "register"; children: React.ReactNode }) {
  const login = mode === "login";
  return (
    <div className={`w-full min-w-0 ${login ? "space-y-6 md:space-y-7" : "space-y-4 md:space-y-[18px]"}`}>
      <header className={login ? "text-center md:text-left" : "text-left"}>
        <h2 className={`font-bold leading-[1.15] tracking-[-.035em] text-ink ${login ? "text-[34px] md:text-[37px]" : "text-[28px] md:text-[30px]"}`}>{login ? "Welcome back" : "Create your account"}</h2>
        <p className={`mt-2 leading-normal text-muted ${login ? "text-[15px] md:whitespace-nowrap md:text-[15.5px]" : "max-w-[300px] text-[13px]"}`}>{login ? "Sign in to continue your journey on Bandhanaa." : "Join Bandhanaa and begin your journey toward something meaningful."}</p>
      </header>
      {children}
      <div className="flex items-center gap-5 text-xs text-muted" aria-label="or"><span className="h-px flex-1 bg-line" /><span>or</span><span className="h-px flex-1 bg-line" /></div>
      <p className="text-center text-[13px] text-muted">{login ? "New to Bandhanaa? " : "Already have an account? "}<Link className="text-accent hover:text-[#8144b5]" href={login ? "/register" : "/login"}>{login ? "Create your profile" : "Sign in"}</Link></p>
      {login && <div className="flex items-center justify-center gap-2 pt-2.5 text-muted md:pt-5"><ShieldIcon /><p className="text-xs">Your privacy matters. Your information stays protected.</p></div>}
    </div>
  );
}
