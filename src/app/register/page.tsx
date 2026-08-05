"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bot, Mail, Lock, User, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Registration failed");
      }

      // Automatically redirect to login after successful registration
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent transition-colors duration-300 p-4">
      <div 
        className="w-full max-w-md bg-bg-secondary p-8 border border-border-theme relative overflow-hidden"
        style={{
          borderRadius: 'var(--radius-theme)',
          boxShadow: 'var(--shadow-theme)',
          backdropFilter: 'var(--glass-backdrop)',
          WebkitBackdropFilter: 'var(--glass-backdrop)'
        }}
      >
        {/* Decorative background element for Glassmorphism */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-accent rounded-full opacity-20 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-accent rounded-full opacity-20 blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-bg-tertiary border border-border-theme rounded-2xl overflow-hidden flex items-center justify-center text-accent shadow-sm">
              <img src="/bot-avatar.png" alt="IR one" className="w-full h-full object-cover" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center text-text-primary mb-2">Create an Account</h1>
          <p className="text-center text-text-muted mb-8 text-sm">Join IR one and start chatting</p>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-900/30 rounded-md text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
              <div className="relative flex items-center">
                <User className="absolute left-3 text-text-muted" size={18} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-bg-tertiary border border-border-theme focus:ring-2 focus:ring-accent focus:border-accent text-text-primary rounded-md py-2.5 pl-10 pr-3 transition-colors outline-none"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 text-text-muted" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-bg-tertiary border border-border-theme focus:ring-2 focus:ring-accent focus:border-accent text-text-primary rounded-md py-2.5 pl-10 pr-3 transition-colors outline-none"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 text-text-muted" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-bg-tertiary border border-border-theme focus:ring-2 focus:ring-accent focus:border-accent text-text-primary rounded-md py-2.5 pl-10 pr-3 transition-colors outline-none"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent text-bg-primary font-medium rounded-md py-2.5 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 mt-6"
            >
              {isLoading ? "Creating account..." : "Sign Up"}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-text-secondary">
            Already have an account?{" "}
            <Link href="/login" className="text-accent font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
