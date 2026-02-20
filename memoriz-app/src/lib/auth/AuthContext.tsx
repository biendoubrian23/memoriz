"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

/* ── Types ─────────────────────────────────────────────── */
type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  avatar_url: string | null;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  authError: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  retryAuth: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ── Supabase singleton (créé une seule fois, jamais pendant un render) ── */
const supabase = createClient();

/* ── Timeout helper — ne bloque JAMAIS plus de 5 s ────── */
const AUTH_TIMEOUT = 5000;

function withTimeout<T>(promise: Promise<T>, ms: number = AUTH_TIMEOUT): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Auth timeout")), ms)
    ),
  ]);
}

/* ── Provider ──────────────────────────────────────────── */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  // Empêche les boucles signOut → onAuthStateChange → signOut
  const isSigningOut = useRef(false);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      setProfile(data ?? null);
    } catch {
      console.warn("[AuthContext] fetchProfile failed (non-blocking)");
      setProfile(null);
    }
  }, []);

  /* ── Initialise la session au montage ────────────────── */
  const initAuth = useCallback(async (mounted: { current: boolean }) => {
    try {
      setLoading(true);
      setAuthError(false);

      const { data: { user: currentUser } } = await withTimeout(
        supabase.auth.getUser()
      );

      if (!mounted.current) return;

      if (currentUser) {
        setUser(currentUser);
        // Session récupérée en non-bloquant
        supabase.auth.getSession().then(({ data: { session: s } }) => {
          if (mounted.current) setSession(s);
        });
        // Profile en non-bloquant (ne bloque pas le chargement)
        fetchProfile(currentUser.id);
      } else {
        setUser(null);
        setSession(null);
        setProfile(null);
      }
    } catch (err) {
      console.error("[AuthContext] initAuth error:", err);
      if (mounted.current) {
        setUser(null);
        setSession(null);
        setProfile(null);
        setAuthError(true);
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [fetchProfile]);

  useEffect(() => {
    const mounted = { current: true };

    initAuth(mounted);

    // Listen for auth changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!mounted.current) return;
        if (isSigningOut.current) return;

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, [initAuth, fetchProfile]);

  /* ── Retry button — relance l'init ───────────────────── */
  const retryAuth = useCallback(() => {
    const mounted = { current: true };
    initAuth(mounted);
    // Cleanup will be handled by component unmount
  }, [initAuth]);

  /* ── Sign up ─────────────────────────────────────────── */
  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName },
      },
    });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("already registered") || msg.includes("already been registered")) {
        return { error: "Cette adresse email est déjà utilisée. Essayez de vous connecter." };
      }
      if (msg.includes("password") && msg.includes("least")) {
        return { error: "Le mot de passe doit contenir au moins 6 caractères." };
      }
      return { error: error.message };
    }
    if (data?.user && (!data.user.identities || data.user.identities.length === 0)) {
      return { error: "Cette adresse email est déjà utilisée. Essayez de vous connecter." };
    }
    return { error: null };
  };

  /* ── Sign in ─────────────────────────────────────────── */
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("invalid login credentials")) {
        return { error: "Email ou mot de passe incorrect." };
      }
      if (msg.includes("email not confirmed")) {
        return { error: "Veuillez confirmer votre adresse email avant de vous connecter." };
      }
      if (msg.includes("too many requests")) {
        return { error: "Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer." };
      }
      return { error: error.message };
    }
    return { error: null };
  };

  /* ── Sign out ────────────────────────────────────────── */
  const signOutFn = async () => {
    isSigningOut.current = true;
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    isSigningOut.current = false;
  };

  /* ── Refresh profile ─────────────────────────────────── */
  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        authError,
        signUp,
        signIn,
        signOut: signOutFn,
        refreshProfile,
        retryAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
