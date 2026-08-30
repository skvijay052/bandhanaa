import { z } from "zod";
const emailOrMobile = z.string().trim().min(1,"Enter your email or mobile number.").refine((value) => {
  if (value.includes("@")) return z.string().email().safeParse(value).success;
  return /^\+?[0-9][0-9 ()-]{6,18}$/.test(value);
}, "Enter a valid email address or mobile number.");
export const loginSchema=z.object({email:emailOrMobile,password:z.string().min(1,"Enter your password.")});
export const registerSchema=z.object({name:z.string().trim().min(2,"Name must be at least 2 characters.").max(60,"Name must be 60 characters or fewer."),email:z.string().trim().min(1,"Enter your email address.").email("Enter a valid email address.").transform(v=>v.toLowerCase()),password:z.string().min(8,"Password must contain at least 8 characters.").max(128,"Password is too long."),confirmPassword:z.string().min(1,"Confirm your password.")}).refine(v=>v.password===v.confirmPassword,{path:["confirmPassword"],message:"Passwords do not match."});
export type LoginValues=z.input<typeof loginSchema>;export type RegisterValues=z.input<typeof registerSchema>;
