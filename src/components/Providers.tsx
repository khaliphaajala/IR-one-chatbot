"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="glassmorphism" themes={["glassmorphism", "minimalist", "cyberpunk"]} enableSystem={false}>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
