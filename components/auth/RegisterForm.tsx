"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { profileFieldOptions } from "@/data/profile-field-options";
import { cityOptions, countries, stateOptions } from "@/data/location-options";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { GoogleButton } from "./GoogleButton";
import { PasswordField } from "./PasswordField";

type OnboardingValues = {
  name: string; email: string; password: string; confirmPassword: string;
  birthDate: string; gender: string; religion: string; motherTongue: string;
  caste: string; maritalStatus: string; height: string; heightUnit: "cm" | "ft"; country: string; state: string; city: string;
  ageMin: string; ageMax: string; preferredHeightMin: string; preferredHeightMax: string;
  education: string; preferredCountry: string; preferredState: string; preferredCity: string; lifestyle: string; aboutPartner: string;
};

const stepFields: Record<number, (keyof OnboardingValues)[]> = {
  1: ["name", "email", "password", "confirmPassword"],
  2: ["birthDate", "gender", "religion", "motherTongue", "caste", "maritalStatus", "height", "country", "state", "city"],
  3: ["ageMin", "ageMax", "education", "preferredCountry", "preferredState", "preferredCity", "lifestyle"],
};

const inputClass = "auth-input !h-[52px] !px-4";

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const { register, handleSubmit, trigger, watch, setValue, formState: { errors, isSubmitting } } = useForm<OnboardingValues>({
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", birthDate: "", gender: "", religion: "", motherTongue: "", caste: "", maritalStatus: "", height: "", heightUnit: "cm", country: "India", state: "", city: "", ageMin: "22", ageMax: "32", preferredHeightMin: "", preferredHeightMax: "", education: "", preferredCountry: "India", preferredState: "", preferredCity: "", lifestyle: "", aboutPartner: "" },
  });
  const password = watch("password");
  const religion = watch("religion");
  const country = watch("country");
  const state = watch("state");
  const preferredCountry = watch("preferredCountry");
  const preferredState = watch("preferredState");
  const aboutLength = watch("aboutPartner")?.length || 0;
  const requirements = useMemo(() => [
    [password.length >= 8, "At least 8 characters"],
    [/[0-9]/.test(password), "One number"],
    [/[A-Z]/.test(password), "One uppercase letter"],
    [/[^A-Za-z0-9]/.test(password), "One special character"],
  ] as const, [password]);

  async function nextStep() {
    setMessage(null);
    if (await trigger(stepFields[step])) setStep((value) => Math.min(3, value + 1));
  }

  async function submit(values: OnboardingValues) {
    if (step < 3) return nextStep();
    setMessage(null);
    try {
      const { data, error } = await createClient().auth.signUp({
        email: values.email.trim().toLowerCase(),
        password: values.password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
          data: {
            display_name: values.name.trim(), birth_date: values.birthDate, gender: values.gender,
            religion: values.religion, mother_tongue: values.motherTongue, caste: values.caste,
            marital_status: values.maritalStatus, height: values.height, height_unit: values.heightUnit,
            country: values.country, state: values.state, city: values.city,
            current_location: [values.city, values.state, values.country].filter(Boolean).join(", "), preferences: {
              age_min: values.ageMin, age_max: values.ageMax, height_min: values.preferredHeightMin,
              height_max: values.preferredHeightMax, education: values.education,
              country: values.preferredCountry, state: values.preferredState, city: values.preferredCity,
              location: [values.preferredCity, values.preferredState, values.preferredCountry].filter(Boolean).join(", "), lifestyle: values.lifestyle, about_partner: values.aboutPartner,
            },
          },
        },
      });
      if (error) {
        const text = error.code === "email_address_invalid" ? "Please use a valid email address that can receive messages." : error.code === "email_exists" || /already registered/i.test(error.message) ? "An account with this email already exists. Try signing in instead." : error.code === "email_not_confirmed" ? "Please confirm your email before continuing." : "We couldn't create your account. Please try again.";
        return setMessage({ type: "error", text });
      }
      if (data.session) { router.replace("/discover"); router.refresh(); }
      else setMessage({ type: "success", text: "Check your email to confirm your account, then sign in." });
    } catch {
      setMessage({ type: "error", text: "Unable to connect. Check your internet connection and try again." });
    }
  }

  return <div className="w-full pb-4">
    <header className="mb-5">
      <h1 className="text-[28px] font-bold tracking-[-.035em] md:text-[32px]">{step === 1 ? "Create your account" : step === 2 ? "Personal details" : "Your preferences"}</h1>
      <p className="mt-1 text-[14px] text-muted">{step === 1 ? "Join Bandhanaa and start your journey." : step === 2 ? "Tell us a little more about yourself." : "Help us understand your partner preferences."}</p>
    </header>

    <Progress step={step} />
    {message && <div role={message.type === "error" ? "alert" : "status"} className={`mb-4 rounded-xl border px-4 py-3 text-sm ${message.type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{message.text}</div>}

    <form noValidate onSubmit={handleSubmit(submit)}>
      {step === 1 && <div className="space-y-3.5">
        <Field label="Full Name" error={errors.name?.message}><input className={inputClass} placeholder="Enter your full name" {...register("name", { required: "Enter your full name.", minLength: { value: 2, message: "Name must be at least 2 characters." } })} /></Field>
        <Field label="Email Address" error={errors.email?.message}><input type="email" className={inputClass} placeholder="Enter your email address" {...register("email", { required: "Enter your email address.", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address." } })} /></Field>
        <Field label="Password" error={errors.password?.message}><PasswordField className="!h-[52px]" placeholder="Create a password" autoComplete="new-password" {...register("password", { required: "Create a password.", validate: (value) => value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value) && /[^A-Za-z0-9]/.test(value) || "Meet all password requirements." })} /></Field>
        <Field label="Confirm Password" error={errors.confirmPassword?.message}><PasswordField className="!h-[52px]" placeholder="Confirm your password" autoComplete="new-password" {...register("confirmPassword", { required: "Confirm your password.", validate: (value) => value === watch("password") || "Passwords do not match." })} /></Field>
        <div><p className="mb-2 text-[12px] font-medium">Password must contain:</p><div className="grid grid-cols-1 gap-x-6 gap-y-2 text-[12px] text-muted sm:grid-cols-2">{requirements.map(([met, label]) => <span key={label} className="flex items-center gap-2"><span className={`flex size-3.5 items-center justify-center rounded-full border ${met ? "border-accent bg-accent text-white" : "border-[#aeb0b8]"}`}>{met ? "✓" : ""}</span>{label}</span>)}</div></div>
      </div>}

      {step === 2 && <div className="grid grid-cols-1 gap-x-5 gap-y-3.5 sm:grid-cols-2">
        <Field label="Date of Birth" error={errors.birthDate?.message}><input type="date" className={inputClass} {...register("birthDate", { required: "Select your date of birth." })} /></Field>
        <Field label="Gender" error={errors.gender?.message}><Select value={watch("gender")} placeholder="Select your gender" options={profileFieldOptions("Gender")} registration={register("gender", { required: "Select your gender." })} /></Field>
        <Field label="Religion" error={errors.religion?.message}><Select value={religion} placeholder="Select your religion" options={profileFieldOptions("Religion")} registration={register("religion", { required: "Select your religion.", onChange: () => setValue("caste", "") })} /></Field>
        <Field label="Mother Tongue" error={errors.motherTongue?.message}><Select value={watch("motherTongue")} placeholder="Select your mother tongue" options={profileFieldOptions("Mother Tongue")} registration={register("motherTongue", { required: "Select your mother tongue." })} /></Field>
        <Field label="Caste" error={errors.caste?.message}><Select value={watch("caste")} placeholder="Select your caste" options={profileFieldOptions("Caste", religion)} registration={register("caste", { required: "Select your caste." })} /></Field>
        <Field label="Marital Status" error={errors.maritalStatus?.message}><Select value={watch("maritalStatus")} placeholder="Select your marital status" options={profileFieldOptions("Marital Status")} registration={register("maritalStatus", { required: "Select your marital status." })} /></Field>
        <Field label="Height" error={errors.height?.message} className="sm:col-span-2"><Select value={watch("height")} placeholder="Select your height" options={profileFieldOptions("Height")} registration={register("height", { required: "Select your height." })} /></Field>
        <div className="sm:col-span-2"><p className="form-label mb-2">Current Location</p><div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Country" error={errors.country?.message}><Select value={country} placeholder="Select country" options={countries} registration={register("country", { required: "Select your country.", onChange: () => { setValue("state", ""); setValue("city", ""); } })} /></Field>
          <Field label="State" error={errors.state?.message}><Select value={state} placeholder="Select state" options={stateOptions(country)} registration={register("state", { required: "Select your state.", onChange: () => setValue("city", "") })} /></Field>
          <Field label="City" error={errors.city?.message}><Select value={watch("city")} placeholder="Select city" options={cityOptions(state)} registration={register("city", { required: "Select your city." })} /></Field>
        </div></div>
      </div>}

      {step === 3 && <div className="space-y-3.5">
        <Field label="Age Range" error={errors.ageMin?.message || errors.ageMax?.message}><div className="flex items-center gap-3"><Select value={watch("ageMin")} placeholder="Min" options={ageOptions} registration={register("ageMin", { required: true })} /><span className="text-sm text-muted">to</span><Select value={watch("ageMax")} placeholder="Max" options={ageOptions} registration={register("ageMax", { required: true })} /></div></Field>
        <Field label="Height"><div className="flex items-center gap-3"><Select value={watch("preferredHeightMin")} placeholder="Minimum" options={profileFieldOptions("Height")} registration={register("preferredHeightMin")} /><span className="text-sm text-muted">to</span><Select value={watch("preferredHeightMax")} placeholder="Maximum" options={profileFieldOptions("Height")} registration={register("preferredHeightMax")} /></div></Field>
        <Field label="Education" error={errors.education?.message}><Select value={watch("education")} placeholder="Select education level" options={profileFieldOptions("Education")} registration={register("education", { required: "Select an education level." })} /></Field>
        <div><p className="form-label mb-2">Preferred Location</p><div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Country" error={errors.preferredCountry?.message}><Select value={preferredCountry} placeholder="Select preferred country" options={countries} registration={register("preferredCountry", { required: "Select a preferred country.", onChange: () => { setValue("preferredState", ""); setValue("preferredCity", ""); } })} /></Field>
          <Field label="State" error={errors.preferredState?.message}><Select value={preferredState} placeholder="Select preferred state" options={stateOptions(preferredCountry)} registration={register("preferredState", { required: "Select a preferred state.", onChange: () => setValue("preferredCity", "") })} /></Field>
          <Field label="City" error={errors.preferredCity?.message}><Select value={watch("preferredCity")} placeholder="Select preferred city" options={cityOptions(preferredState)} registration={register("preferredCity", { required: "Select a preferred city." })} /></Field>
        </div></div>
        <Field label="Lifestyle" error={errors.lifestyle?.message}><Select value={watch("lifestyle")} placeholder="Select lifestyle" options={profileFieldOptions("Lifestyle")} registration={register("lifestyle", { required: "Select a lifestyle." })} /></Field>
        <Field label="About"><div className="relative"><textarea maxLength={200} rows={3} className="w-full resize-none rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/10" placeholder="Share a few words about your ideal partner..." {...register("aboutPartner")} /><span className="absolute bottom-2.5 right-3 text-xs text-muted">{aboutLength}/200</span></div></Field>
      </div>}

      <div className={`mt-5 grid gap-4 ${step > 1 ? "grid-cols-[136px_1fr]" : "grid-cols-1"}`}>
        {step > 1 && <button type="button" onClick={() => setStep((value) => value - 1)} className="auth-button auth-button-social">← <span className="ml-3">Back</span></button>}
        <button type={step === 3 ? "submit" : "button"} onClick={step < 3 ? nextStep : undefined} disabled={isSubmitting} className="auth-button auth-button-primary">{isSubmitting ? "Creating account…" : step === 3 ? "Complete & Continue" : "Continue"}</button>
      </div>
    </form>

    <div className="my-4 flex items-center gap-5 text-xs text-muted"><span className="h-px flex-1 bg-line" /><span>or</span><span className="h-px flex-1 bg-line" /></div>
    <GoogleButton disabled={isSubmitting} onError={(text) => setMessage({ type: "error", text })} />
    <p className="mt-4 text-center text-[12px] text-muted">By creating an account, you agree to our <Link href="/terms" className="text-accent">Terms of Use</Link> and <Link href="/privacy" className="text-accent">Privacy Policy</Link>.</p>
  </div>;
}

const ageOptions = Array.from({ length: 53 }, (_, index) => String(index + 18));

function Progress({ step }: { step: number }) {
  return <div className="mb-6 grid grid-cols-3"><Step number={1} label="Account" active={step >= 1} done={step > 1} /><Step number={2} label="Personal" active={step >= 2} done={step > 2} /><Step number={3} label="Preferences" active={step >= 3} done={false} last /></div>;
}
function Step({ number, label, active, done, last = false }: { number: number; label: string; active: boolean; done: boolean; last?: boolean }) {
  return <div className="relative"><div className={`absolute left-[calc(50%+20px)] right-[-50%] top-4 h-px ${done && !last ? "bg-accent" : "bg-line"} ${last ? "hidden" : ""}`} /><div className="relative z-10 flex flex-col items-center gap-2"><span className={`flex size-8 items-center justify-center rounded-full border text-sm ${active ? "border-accent bg-accent text-white" : "border-line bg-white text-muted"}`}>{done ? "✓" : number}</span><span className={`text-[11px] ${active ? "font-semibold text-[#3c0749]" : "text-muted"}`}>{label}</span></div></div>;
}
function Field({ label, error, className = "", children }: { label: string; error?: string; className?: string; children: React.ReactNode }) { return <div className={className}><label className="form-label mb-2">{label}</label>{children}{error && <p className="field-error">{error}</p>}</div>; }
function Select({ value, placeholder, options, registration }: { value: string; placeholder: string; options: string[]; registration: UseFormRegisterReturn }) {
  return <SearchableSelect hideLabel label={placeholder} value={value} options={options} placeholder={placeholder} onChange={(nextValue) => void registration.onChange({ target: { name: registration.name, value: nextValue }, type: "change" })} />;
}
