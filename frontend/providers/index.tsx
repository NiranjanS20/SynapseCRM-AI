"use client";

import { type ReactNode } from "react";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";
import { AuthProvider } from "./auth-provider";
import { WebsocketProvider } from "./websocket-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <QueryProvider>
        <AuthProvider>
          <WebsocketProvider>
            {children}
          </WebsocketProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
