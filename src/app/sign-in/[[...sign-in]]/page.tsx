import { SignIn } from "@clerk/nextjs";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign In | Boardly",
  description: "Sign in to your Boardly account",
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Boardly Logo"
              width={40}
              height={40}
              className="h-10 w-10"
              priority
            />
            <span className="text-2xl font-bold">Boardly</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
            Sign in to your account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Access your boards and continue where you left off
          </p>
        </div>
        
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground text-sm normal-case",
              card: "bg-card shadow-md rounded-lg border border-border",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              formFieldLabel: "text-foreground",
              formFieldInput: "bg-background border-input text-foreground",
              footerActionLink: "text-primary hover:text-primary/90",
              identityPreviewText: "text-foreground",
              identityPreviewEditButton: "text-primary hover:text-primary/90",
              formResendCodeLink: "text-primary hover:text-primary/90",
              socialButtonsBlockButton: "border-border text-foreground hover:bg-muted",
              socialButtonsBlockButtonText: "text-foreground",
              formFieldAction: "text-primary hover:text-primary/90",
              formFieldSuccessText: "text-success-foreground",
              alert: "bg-background border-border text-foreground",
              alertText: "text-foreground",
              alertIcon: "text-foreground",
              dividerLine: "bg-border",
              dividerText: "text-muted-foreground",
            },
          }}
        />
        
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-medium text-primary hover:text-primary/90">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
} 