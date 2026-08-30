import type { Metadata } from "next";import { AuthLayout } from "@/components/auth/AuthLayout";import { RegisterForm } from "@/components/auth/RegisterForm";
export const metadata:Metadata={title:"Create Account",robots:{index:false,follow:false}};
export default function RegisterPage(){return <AuthLayout mode="register"><RegisterForm/></AuthLayout>}
