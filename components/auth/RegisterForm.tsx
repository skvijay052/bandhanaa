"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { verificationEmailStorageKey } from "@/lib/auth-verification";
import { profileFieldOptions } from "@/data/profile-field-options";
import { cityOptions, countries, stateOptions } from "@/data/location-options";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { DatePicker } from "@/components/ui/DatePicker";
import { GoogleButton } from "./GoogleButton";
import { PasswordField } from "./PasswordField";

const OTP_LENGTH = 6;
const inputClass = "auth-input !h-11 !px-3 !py-1";
const ageOptions = Array.from({ length: 53 }, (_, index) => String(index + 18));

type OnboardingValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
  birthTime: string;
  gender: string;
  religion: string;
  motherTongue: string;
  caste: string;
  maritalStatus: string;
  height: string;
  weight: string;
  country: string;
  state: string;
  city: string;
  education: string;
  profession: string;
  company: string;
  lookingFor: string;
  ageMin: string;
  ageMax: string;
  preferredHeightMin: string;
  preferredHeightMax: string;
  preferredMaritalStatus: string;
  preferredCountry: string;
  preferredState: string;
  preferredCity: string;
  preferredReligion: string;
  preferredCaste: string;
  preferredEducation: string;
  preferredProfession: string;
  preferredAnnualIncome: string;
  preferredDiet: string;
  preferredSmoking: string;
  preferredDrinking: string;
  preferredFamilyType: string;
  preferredFamilyValues: string;
  relocation: string;
  aboutPartner: string;
};

type RegistrationState =
  "idle" | "checking" | "submitting" | "verifying" | "resending";

const stepFields: Partial<Record<number, (keyof OnboardingValues)[]>> = {
  1: ["name", "email", "password", "confirmPassword"],
  2: [
    "birthDate",
    "birthTime",
    "gender",
    "religion",
    "motherTongue",
    "maritalStatus",
    "height",
    "weight",
    "country",
    "state",
    "city",
    "education",
    "profession",
    "company",
  ],
};

function friendlyOtpError(message: string) {
  if (/expired/i.test(message))
    return "This code has expired. Request a new one.";
  if (/invalid|token|otp/i.test(message))
    return "The verification code is incorrect.";
  return "We couldn't verify this code. Please try again.";
}

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [registrationState, setRegistrationState] =
    useState<RegistrationState>("idle");
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      birthDate: "",
      birthTime: "",
      gender: "",
      religion: "",
      motherTongue: "",
      caste: "",
      maritalStatus: "",
      height: "",
      weight: "",
      country: "India",
      state: "",
      city: "",
      education: "",
      profession: "",
      company: "",
      lookingFor: "",
      ageMin: "",
      ageMax: "",
      preferredHeightMin: "",
      preferredHeightMax: "",
      preferredMaritalStatus: "",
      preferredCountry: "",
      preferredState: "",
      preferredCity: "",
      preferredReligion: "",
      preferredCaste: "",
      preferredEducation: "",
      preferredProfession: "",
      preferredAnnualIncome: "",
      preferredDiet: "",
      preferredSmoking: "",
      preferredDrinking: "",
      preferredFamilyType: "",
      preferredFamilyValues: "",
      relocation: "",
      aboutPartner: "",
    },
  });

  const password = watch("password");
  const email = watch("email").trim().toLowerCase();
  const religion = watch("religion");
  const country = watch("country");
  const state = watch("state");
  const preferredCountry = watch("preferredCountry");
  const preferredState = watch("preferredState");
  const preferredReligion = watch("preferredReligion");
  const aboutLength = watch("aboutPartner")?.length || 0;
  const busy = isSubmitting || registrationState !== "idle";
  const requirements = useMemo(
    () =>
      [
        [password.length >= 8, "At least 8 characters"],
        [/[A-Z]/.test(password), "One uppercase letter"],
        [/[a-z]/.test(password), "One lowercase letter"],
        [/[0-9]/.test(password), "One number"],
        [/[^A-Za-z0-9]/.test(password), "One special character"],
      ] as const,
    [password],
  );

  useEffect(() => {
    if (step !== 4 || countdown <= 0) return;
    const timer = window.setInterval(
      () => setCountdown((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [step, countdown]);

  async function continueFromAccount() {
    setMessage(null);
    if (!(await trigger(stepFields[1]))) return;
    setRegistrationState("checking");
    try {
      const { data, error } = await createClient().rpc(
        "registration_email_status",
        { candidate_email: email },
      );
      if (error) {
        setMessage({
          type: "error",
          text: "We couldn't check this email. Please try again.",
        });
        return;
      }
      if (data === "verified") {
        setMessage({
          type: "error",
          text: "An account already exists with this email. Please sign in.",
        });
        return;
      }
      if (data === "unverified") {
        setMessage({
          type: "success",
          text: "This email has already started registration. Continue to resend verification after completing your details.",
        });
      }
      setStep(2);
    } catch {
      setMessage({
        type: "error",
        text: "Unable to check this email. Check your connection and try again.",
      });
    } finally {
      setRegistrationState("idle");
    }
  }

  async function continueFromPersonal() {
    setMessage(null);
    if (await trigger(stepFields[2])) setStep(3);
  }

  async function createAccount() {
    setMessage(null);
    setRegistrationState("submitting");
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: watch("name").trim() } },
      });
      const existingRegistration =
        error?.code === "user_already_exists" ||
        error?.code === "email_exists" ||
        /already registered|already exists/i.test(error?.message ?? "") ||
        Boolean(data.user && data.user.identities?.length === 0);

      if (existingRegistration) {
        const { error: resendError } = await supabase.auth.resend({
          type: "signup",
          email,
        });
        if (resendError) {
          setMessage({
            type: "error",
            text: /already confirmed/i.test(resendError.message)
              ? "This email is already verified. Please sign in."
              : "This email has already started registration. We couldn't resend the verification code yet; please wait a moment and try again.",
          });
          return;
        }
        localStorage.setItem(verificationEmailStorageKey, email);
        setOtp("");
        setCountdown(60);
        setStep(4);
        setMessage({
          type: "success",
          text: "This email has already started registration. A new verification code was sent.",
        });
        return;
      }

      if (error) {
        setMessage({
          type: "error",
          text:
            error.code === "email_address_invalid"
              ? "Please use a valid email address."
              : "We couldn't start verification. Please try again.",
        });
        return;
      }

      if (data.session && data.user?.email_confirmed_at) {
        await completeRegistration(watch());
        return;
      }

      localStorage.setItem(verificationEmailStorageKey, email);
      setOtp("");
      setCountdown(60);
      setStep(4);
    } catch {
      setMessage({
        type: "error",
        text: "Unable to connect. Check your internet connection and try again.",
      });
    } finally {
      setRegistrationState("idle");
    }
  }

  async function verifyOtp(values: OnboardingValues) {
    if (otp.length !== OTP_LENGTH) {
      setMessage({
        type: "error",
        text: `Enter the complete ${OTP_LENGTH}-digit verification code.`,
      });
      return;
    }
    setMessage(null);
    setRegistrationState("verifying");
    try {
      const { data, error } = await createClient().auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });
      if (error) {
        setMessage({ type: "error", text: friendlyOtpError(error.message) });
        return;
      }
      if (!data.session || !data.user?.email_confirmed_at) {
        setMessage({
          type: "error",
          text: "Verification succeeded, but your session could not be started.",
        });
        return;
      }
      await completeRegistration(values);
    } catch {
      setMessage({
        type: "error",
        text: "Unable to connect. Please try again.",
      });
    } finally {
      setRegistrationState("idle");
    }
  }

  async function completeRegistration(values: OnboardingValues) {
    const partnerPreferences = [
      { label: "Looking For", value: values.lookingFor },
      {
        label: "Age Range",
        value: [values.ageMin, values.ageMax].filter(Boolean).join(" - "),
      },
      {
        label: "Height",
        value: [values.preferredHeightMin, values.preferredHeightMax]
          .filter(Boolean)
          .join(" - "),
      },
      { label: "Marital Status", value: values.preferredMaritalStatus },
      { label: "Preferred Country", value: values.preferredCountry },
      { label: "Preferred State", value: values.preferredState },
      { label: "Preferred City", value: values.preferredCity },
      { label: "Religion", value: values.preferredReligion },
      { label: "Caste (Optional)", value: values.preferredCaste },
      { label: "Education", value: values.preferredEducation },
      { label: "Profession", value: values.preferredProfession },
      { label: "Annual Income", value: values.preferredAnnualIncome },
      { label: "Diet", value: values.preferredDiet },
      { label: "Smoking", value: values.preferredSmoking },
      { label: "Drinking", value: values.preferredDrinking },
      { label: "Family Type", value: values.preferredFamilyType },
      { label: "Family Values", value: values.preferredFamilyValues },
      { label: "Relocation", value: values.relocation },
      { label: "About My Ideal Partner", value: values.aboutPartner.trim() },
    ];
    const { data: completion, error } = await createClient().rpc(
      "complete_verified_registration",
      {
        profile_data: {
          display_name: values.name.trim(),
          birth_date: values.birthDate,
          gender: values.gender,
          religion: values.religion,
          mother_tongue: values.motherTongue,
          marital_status: values.maritalStatus,
          height: values.height,
          weight: values.weight,
          country: values.country,
          state: values.state,
          city: values.city,
          education: values.education,
          profession: values.profession,
          company: values.company.trim(),
          horoscope: [
            { label: "Date of Birth", value: values.birthDate },
            { label: "Time of Birth", value: values.birthTime },
          ],
        },
        preferences: partnerPreferences,
      },
    );
    const row = Array.isArray(completion) ? completion[0] : completion;
    if (
      error ||
      !row?.onboarding_completed ||
      row.registration_status !== "active"
    ) {
      setMessage({
        type: "error",
        text: "Your email is verified, but we couldn't save your profile. Please try again.",
      });
      return;
    }
    localStorage.removeItem(verificationEmailStorageKey);
    router.replace("/discover");
    router.refresh();
  }

  async function resendOtp() {
    if (countdown > 0) return;
    setMessage(null);
    setRegistrationState("resending");
    try {
      const { error } = await createClient().auth.resend({
        type: "signup",
        email,
      });
      if (error) {
        setMessage({
          type: "error",
          text: "We couldn't resend the code. Please try again.",
        });
        return;
      }
      setOtp("");
      setCountdown(60);
      setMessage({
        type: "success",
        text: "A new verification code was sent.",
      });
    } finally {
      setRegistrationState("idle");
    }
  }

  const titles = [
    "",
    "Create your account",
    "Tell us about you",
    "Partner preferences",
    "Confirm your email",
  ];
  const subtitles = [
    "",
    "Let's begin your Bandhanaa journey",
    "Help us build your profile",
    "Tell us what matters to you",
    `We sent a 6-digit code to ${email}`,
  ];

  return (
    <div className="w-full pb-2">
      <Progress step={step} />
      <header className="mb-5">
        <h1 className="text-[28px] font-bold tracking-[-.035em] text-[#111827] lg:text-[32px]">
          {titles[step]}
        </h1>
        <p className="mt-1 text-[14px] text-[#68718b]">{subtitles[step]}</p>
      </header>

      {message ? (
        <div
          role={message.type === "error" ? "alert" : "status"}
          className={`mb-4 rounded-xl border px-4 py-3 text-sm ${message.type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}
        >
          {message.text}
        </div>
      ) : null}

      <form noValidate onSubmit={(event) => event.preventDefault()}>
        {step === 1 ? (
          <AccountStep
            register={register}
            errors={errors}
            password={password}
            requirements={requirements}
            watchPassword={watch("password")}
          />
        ) : null}
        {step === 4 ? (
          <div className="py-6">
            <label className="form-label mb-3 block" htmlFor="registration-otp">
              Verification code
            </label>
            <input
              id="registration-otp"
              value={otp}
              onChange={(event) => {
                setOtp(
                  event.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH),
                );
                setMessage(null);
              }}
              inputMode="numeric"
              autoComplete="one-time-code"
              className="h-16 w-full rounded-2xl border border-[#d8dce8] bg-white px-5 text-center text-2xl font-bold tracking-[.55em] outline-none focus:border-black focus:ring-4 focus:ring-black/5"
              placeholder="000000"
            />
            <div className="mt-4 flex items-center justify-between text-sm text-muted">
              <span>Didn&apos;t receive the code?</span>
              <button
                type="button"
                disabled={countdown > 0 || busy}
                onClick={() => void resendOtp()}
                className="font-semibold text-black disabled:text-muted"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
              </button>
            </div>
          </div>
        ) : null}
        {step === 2 ? (
          <PersonalStep
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            religion={religion}
            country={country}
            state={state}
          />
        ) : null}
        {step === 3 ? (
          <PreferencesStep
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            preferredCountry={preferredCountry}
            preferredState={preferredState}
            preferredReligion={preferredReligion}
            aboutLength={aboutLength}
          />
        ) : null}

        <div
          className={`mt-6 grid gap-3 ${step === 3 ? "grid-cols-1 sm:grid-cols-[100px_120px_1fr]" : step > 1 && step < 4 ? "grid-cols-[120px_1fr]" : "grid-cols-1"}`}
        >
          {step > 1 && step < 4 ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setMessage(null);
                setStep((value) => Math.max(1, value - 1));
              }}
              className="auth-button auth-button-social"
            >
              <ArrowLeft size={17} />
              <span className="ml-2">Back</span>
            </button>
          ) : null}
          {step === 3 ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void createAccount()}
              className="auth-button auth-button-social"
            >
              Skip for now
            </button>
          ) : null}
          <button
            type="button"
            disabled={busy}
            onClick={
              step === 1
                ? () => void continueFromAccount()
                : step === 2
                  ? () => void continueFromPersonal()
                  : step === 3
                    ? () => void createAccount()
                    : handleSubmit(verifyOtp)
            }
            className="auth-button auth-button-primary !bg-black !text-white hover:!bg-[#222] focus:!ring-black/20"
          >
            {registrationState === "checking"
              ? "Checking email…"
              : registrationState === "submitting"
                ? "Starting verification…"
                : registrationState === "verifying"
                  ? "Verifying…"
                  : step === 3
                    ? "Continue to Verification"
                    : step === 4
                      ? "Verify & Complete"
                      : "Continue"}
            {!busy ? <ArrowRight className="ml-2" size={19} /> : null}
          </button>
        </div>
      </form>

      {step === 1 ? (
        <>
          <div className="my-4 flex items-center gap-5 text-xs text-muted">
            <span className="h-px flex-1 bg-line" />
            <span>or</span>
            <span className="h-px flex-1 bg-line" />
          </div>
          <GoogleButton
            disabled={busy}
            onError={(text) =>
              setMessage(text ? { type: "error", text } : null)
            }
          />
          <p className="mt-4 text-center text-[12px] text-muted">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-black underline">
              Terms of Use
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-black underline">
              Privacy Policy
            </Link>
            .
          </p>
        </>
      ) : null}
    </div>
  );
}

function AccountStep({
  register,
  errors,
  requirements,
}: {
  register: ReturnType<typeof useForm<OnboardingValues>>["register"];
  errors: ReturnType<typeof useForm<OnboardingValues>>["formState"]["errors"];
  password: string;
  requirements: readonly (readonly [boolean, string])[];
  watchPassword: string;
}) {
  return (
    <div className="space-y-3.5">
      <Field label="Full Name" error={errors.name?.message}>
        <input
          className={inputClass}
          placeholder="Enter your full name"
          {...register("name", {
            required: "Enter your full name.",
            minLength: {
              value: 2,
              message: "Name must be at least 2 characters.",
            },
          })}
        />
      </Field>
      <Field label="Email Address" error={errors.email?.message}>
        <input
          type="email"
          className={inputClass}
          placeholder="Enter your email address"
          {...register("email", {
            required: "Enter your email address.",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email address.",
            },
          })}
        />
      </Field>
      <div className="grid gap-3.5 md:grid-cols-2">
        <Field label="Password" error={errors.password?.message}>
          <PasswordField
            className="!h-11 !py-1"
            placeholder="Create a password"
            autoComplete="new-password"
            {...register("password", {
              required: "Create a password.",
              validate: (value) =>
                (value.length >= 8 &&
                  /[A-Z]/.test(value) &&
                  /[a-z]/.test(value) &&
                  /[0-9]/.test(value) &&
                  /[^A-Za-z0-9]/.test(value)) ||
                "Meet all password requirements.",
            })}
          />
        </Field>
        <Field label="Confirm Password" error={errors.confirmPassword?.message}>
          <PasswordField
            className="!h-11 !py-1"
            placeholder="Confirm your password"
            autoComplete="new-password"
            {...register("confirmPassword", {
              required: "Confirm your password.",
              validate: (value, values) =>
                value === values.password || "Passwords do not match.",
            })}
          />
        </Field>
      </div>
      <div className="rounded-2xl bg-[#faf2fb] px-4 py-3">
        <p className="mb-2 flex items-center gap-2 text-[12px] font-semibold">
          <ShieldCheck size={18} className="text-fuchsia-500" />
          Password must contain:
        </p>
        <div className="grid gap-x-5 gap-y-1 text-[11px] text-muted sm:grid-cols-2">
          {requirements.map(([met, label]) => (
            <span key={label} className="flex items-center gap-2">
              <span
                className={`grid size-3.5 place-items-center rounded-full border ${met ? "border-black bg-black text-white" : "border-[#aeb0b8]"}`}
              >
                {met ? <Check size={9} /> : null}
              </span>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PersonalStep({
  register,
  errors,
  watch,
  setValue,
  religion,
  country,
  state,
}: FormStepProps & { religion: string; country: string; state: string }) {
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-3.5 sm:grid-cols-2">
      <Field
        label="Date & Time of Birth"
        error={errors.birthDate?.message || errors.birthTime?.message}
        className="sm:col-span-2"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <span className="mb-1.5 block text-xs text-muted">Date</span>
            <DatePicker
              hideLabel
              compact
              required
              label="Date of Birth"
              value={watch("birthDate")}
              onChange={(value) =>
                setValue("birthDate", value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
            <input
              type="hidden"
              {...register("birthDate", {
                required: "Select your date of birth.",
              })}
            />
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs text-muted">Time</span>
            <input
              type="time"
              step={300}
              className={`${inputClass} cursor-pointer [color-scheme:light]`}
              {...register("birthTime", {
                required: "Select your time of birth.",
              })}
            />
          </label>
        </div>
      </Field>
      <Field label="Gender" error={errors.gender?.message}>
        <Select
          value={watch("gender")}
          placeholder="Select your gender"
          options={profileFieldOptions("Gender")}
          registration={register("gender", { required: "Select your gender." })}
        />
      </Field>
      <Field label="Religion" error={errors.religion?.message}>
        <Select
          value={religion}
          placeholder="Select your religion"
          options={profileFieldOptions("Religion")}
          registration={register("religion", {
            required: "Select your religion.",
            onChange: () => setValue("caste", ""),
          })}
        />
      </Field>
      <Field label="Mother Tongue" error={errors.motherTongue?.message}>
        <Select
          value={watch("motherTongue")}
          placeholder="Select mother tongue"
          options={profileFieldOptions("Mother Tongue")}
          registration={register("motherTongue", {
            required: "Select your mother tongue.",
          })}
        />
      </Field>
      <Field label="Marital Status" error={errors.maritalStatus?.message}>
        <Select
          value={watch("maritalStatus")}
          placeholder="Select marital status"
          options={profileFieldOptions("Marital Status")}
          registration={register("maritalStatus", {
            required: "Select your marital status.",
          })}
        />
      </Field>
      <Field label="Height" error={errors.height?.message}>
        <Select
          value={watch("height")}
          placeholder="Select height"
          options={profileFieldOptions("Height")}
          registration={register("height", { required: "Select your height." })}
        />
      </Field>
      <Field label="Weight" error={errors.weight?.message}>
        <Select
          value={watch("weight")}
          placeholder="Select weight"
          options={profileFieldOptions("Weight")}
          registration={register("weight", { required: "Select your weight." })}
        />
      </Field>
      <Field label="Education" error={errors.education?.message}>
        <Select
          value={watch("education")}
          placeholder="Select education"
          options={profileFieldOptions("Education")}
          registration={register("education", {
            required: "Select your education.",
          })}
        />
      </Field>
      <Field label="Profession" error={errors.profession?.message}>
        <Select
          value={watch("profession")}
          placeholder="Select profession"
          options={profileFieldOptions("Profession")}
          registration={register("profession", {
            required: "Select your profession.",
          })}
        />
      </Field>
      <Field label="Company" error={errors.company?.message}>
        <input
          className={inputClass}
          placeholder="Enter your company"
          {...register("company", {
            required: "Enter your company.",
            validate: (value) =>
              value.trim().length >= 2 || "Enter a valid company name.",
          })}
        />
      </Field>
      <div className="sm:col-span-2">
        <p className="form-label mb-2">Current Location</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Country" error={errors.country?.message}>
            <Select
              value={country}
              placeholder="Country"
              options={countries}
              registration={register("country", {
                required: "Select your country.",
                onChange: () => {
                  setValue("state", "");
                  setValue("city", "");
                },
              })}
            />
          </Field>
          <Field label="State" error={errors.state?.message}>
            <Select
              value={state}
              placeholder="State"
              options={stateOptions(country)}
              registration={register("state", {
                required: "Select your state.",
                onChange: () => setValue("city", ""),
              })}
            />
          </Field>
          <Field label="City" error={errors.city?.message}>
            <Select
              value={watch("city")}
              placeholder="City"
              options={cityOptions(state)}
              registration={register("city", { required: "Select your city." })}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

type FormStepProps = {
  register: ReturnType<typeof useForm<OnboardingValues>>["register"];
  errors: ReturnType<typeof useForm<OnboardingValues>>["formState"]["errors"];
  watch: ReturnType<typeof useForm<OnboardingValues>>["watch"];
  setValue: ReturnType<typeof useForm<OnboardingValues>>["setValue"];
};
function PreferencesStep({
  register,
  watch,
  setValue,
  preferredCountry,
  preferredState,
  preferredReligion,
  aboutLength,
}: FormStepProps & {
  preferredCountry: string;
  preferredState: string;
  preferredReligion: string;
  aboutLength: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-3.5 sm:grid-cols-2">
      <Field label="Looking For" optional>
        <Select
          value={watch("lookingFor")}
          placeholder="Any"
          options={profileFieldOptions("Looking For")}
          registration={register("lookingFor")}
        />
      </Field>
      <Field label="Age Range" optional>
        <div className="flex items-center gap-3">
          <Select
            value={watch("ageMin")}
            placeholder="Min"
            options={ageOptions}
            registration={register("ageMin")}
          />
          <span className="text-sm text-muted">to</span>
          <Select
            value={watch("ageMax")}
            placeholder="Max"
            options={ageOptions}
            registration={register("ageMax")}
          />
        </div>
      </Field>
      <Field label="Height" optional>
        <div className="flex items-center gap-3">
          <Select
            value={watch("preferredHeightMin")}
            placeholder="Minimum"
            options={profileFieldOptions("Height")}
            registration={register("preferredHeightMin")}
          />
          <span className="text-sm text-muted">to</span>
          <Select
            value={watch("preferredHeightMax")}
            placeholder="Maximum"
            options={profileFieldOptions("Height")}
            registration={register("preferredHeightMax")}
          />
        </div>
      </Field>
      <Field label="Marital Status" optional>
        <Select
          value={watch("preferredMaritalStatus")}
          placeholder="Any"
          options={profileFieldOptions("Marital Status")}
          registration={register("preferredMaritalStatus")}
        />
      </Field>
      <Field label="Preferred Country" optional>
        <Select
          value={preferredCountry}
          placeholder="Any country"
          options={countries}
          registration={register("preferredCountry", {
            onChange: () => {
              setValue("preferredState", "");
              setValue("preferredCity", "");
            },
          })}
        />
      </Field>
      <Field label="Preferred State" optional>
        <Select
          value={preferredState}
          placeholder="Any state"
          options={stateOptions(preferredCountry)}
          registration={register("preferredState", {
            onChange: () => setValue("preferredCity", ""),
          })}
        />
      </Field>
      <Field label="Preferred City" optional>
        <Select
          value={watch("preferredCity")}
          placeholder="Any city"
          options={cityOptions(preferredState)}
          registration={register("preferredCity")}
        />
      </Field>
      <Field label="Religion" optional>
        <Select
          value={preferredReligion}
          placeholder="Any"
          options={profileFieldOptions("Religion")}
          registration={register("preferredReligion", {
            onChange: () => setValue("preferredCaste", ""),
          })}
        />
      </Field>
      <Field label="Caste (Optional)" optional>
        <Select
          value={watch("preferredCaste")}
          placeholder="Any"
          options={profileFieldOptions("Caste (Optional)", preferredReligion)}
          registration={register("preferredCaste")}
        />
      </Field>
      <Field label="Education" optional>
        <Select
          value={watch("preferredEducation")}
          placeholder="Any"
          options={profileFieldOptions("Education")}
          registration={register("preferredEducation")}
        />
      </Field>
      <Field label="Profession" optional>
        <Select
          value={watch("preferredProfession")}
          placeholder="Any"
          options={profileFieldOptions("Profession")}
          registration={register("preferredProfession")}
        />
      </Field>
      <Field label="Annual Income" optional>
        <Select
          value={watch("preferredAnnualIncome")}
          placeholder="Any"
          options={profileFieldOptions("Annual Income")}
          registration={register("preferredAnnualIncome")}
        />
      </Field>
      <Field label="Diet" optional>
        <Select
          value={watch("preferredDiet")}
          placeholder="Any"
          options={profileFieldOptions("Diet")}
          registration={register("preferredDiet")}
        />
      </Field>
      <Field label="Smoking" optional>
        <Select
          value={watch("preferredSmoking")}
          placeholder="Any"
          options={profileFieldOptions("Smoking")}
          registration={register("preferredSmoking")}
        />
      </Field>
      <Field label="Drinking" optional>
        <Select
          value={watch("preferredDrinking")}
          placeholder="Any"
          options={profileFieldOptions("Drinking")}
          registration={register("preferredDrinking")}
        />
      </Field>
      <Field label="Family Type" optional>
        <Select
          value={watch("preferredFamilyType")}
          placeholder="Any"
          options={profileFieldOptions("Family Type")}
          registration={register("preferredFamilyType")}
        />
      </Field>
      <Field label="Family Values" optional>
        <Select
          value={watch("preferredFamilyValues")}
          placeholder="Any"
          options={profileFieldOptions("Family Values")}
          registration={register("preferredFamilyValues")}
        />
      </Field>
      <Field label="Relocation" optional>
        <Select
          value={watch("relocation")}
          placeholder="Any"
          options={profileFieldOptions("Relocation")}
          registration={register("relocation")}
        />
      </Field>
      <Field label="About My Ideal Partner" className="sm:col-span-2" optional>
        <div className="relative">
          <textarea
            maxLength={200}
            rows={3}
            className="w-full resize-none rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-black focus:ring-[3px] focus:ring-black/10"
            placeholder="Share a few words about your ideal partner..."
            {...register("aboutPartner")}
          />
          <span className="absolute bottom-2.5 right-3 text-xs text-muted">
            {aboutLength}/200
          </span>
        </div>
      </Field>
    </div>
  );
}
function Progress({ step }: { step: number }) {
  const labels = ["Account", "About You", "Preferences", "Verify OTP"];
  return (
    <div className="mb-6 grid grid-cols-4">
      {labels.map((label, index) => (
        <Step
          key={label}
          number={index + 1}
          label={label}
          active={step >= index + 1}
          done={step > index + 1}
          last={index === labels.length - 1}
        />
      ))}
    </div>
  );
}
function Step({
  number,
  label,
  active,
  done,
  last,
}: {
  number: number;
  label: string;
  active: boolean;
  done: boolean;
  last: boolean;
}) {
  return (
    <div className="relative">
      <div
        className={`absolute left-[calc(50%+20px)] right-[-50%] top-4 h-px ${done ? "bg-black" : "bg-line"} ${last ? "hidden" : ""}`}
      />
      <div className="relative z-10 flex flex-col items-center gap-2">
        <span
          className={`flex size-8 items-center justify-center rounded-full border text-sm ${active ? "border-black bg-black text-white" : "border-line bg-white text-muted"}`}
        >
          {done ? <Check size={15} /> : number}
        </span>
        <span
          className={`text-center text-[10px] sm:text-[11px] ${active ? "font-semibold text-black" : "text-muted"}`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
function Field({
  label,
  error,
  className = "",
  children,
  optional = false,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <div className={className}>
      <label className="form-label mb-2">
        {label} {!optional ? <span className="text-pink-500">*</span> : null}
      </label>
      {children}
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
function Select({
  value,
  placeholder,
  options,
  registration,
}: {
  value: string;
  placeholder: string;
  options: string[];
  registration: UseFormRegisterReturn;
}) {
  return (
    <div className="[&_.form-control]:!mt-0 [&_.form-control]:!min-h-11 [&_.form-control]:!px-3 [&_.form-control]:!py-1">
      <SearchableSelect
        hideLabel
        label={placeholder}
        value={value}
        options={options}
        placeholder={placeholder}
        onChange={(nextValue) =>
          void registration.onChange({
            target: { name: registration.name, value: nextValue },
            type: "change",
          })
        }
      />
    </div>
  );
}
