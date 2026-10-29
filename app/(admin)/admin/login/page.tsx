import { LoginForm } from "./login-form";

export const metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm rounded-xl border border-line bg-paper p-8">
        <p className="font-mono text-xs text-ink-soft">admin</p>
        <h1 className="mt-1 font-display text-2xl font-medium text-ink">
          Login
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}
