"use client";

import { useEffect, useState, useRef } from "react";
import { X, Mail, Lock, User } from "lucide-react";
import { AuthService, type SignUpData, type SignInData } from '@/lib/auth';

type AuthType = "signup" | "login";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  type: AuthType;
  onSwitchType?: (type: AuthType) => void;
}

export function AuthModal({ open, onClose, type, onSwitchType }: AuthModalProps) {
  const [animateIn, setAnimateIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setAnimateIn(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow || "";
      window.removeEventListener("keydown", onKey);
      setAnimateIn(false);
      setError(null);
      setSuccess(null);
    };
  }, [open, onClose]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    
    try {
      if (isSignup) {
        const signUpData: SignUpData = {
          email: formData.get('email') as string,
          password: formData.get('password') as string,
          firstName: formData.get('firstName') as string,
          lastName: formData.get('lastName') as string,
          phone: formData.get('phone') as string || undefined,
        };
        
        await AuthService.signUp(signUpData);
        setSuccess('Registrácia bola úspešná! Skontrolujte svoj email pre potvrdenie.');
      } else {
        const signInData: SignInData = {
          email: formData.get('email') as string,
          password: formData.get('password') as string,
        };
        
        await AuthService.signIn(signInData);
        setSuccess('Prihlásenie bolo úspešné!');
        window.setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || 'Nastala chyba. Skúste to znova.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
  setLoading(true);
  setError(null);
  try {
    await AuthService.signInWithGoogle();
  } catch (err: any) {
    setError(err.message || 'Prihlásenie cez Google zlyhalo.');
  } finally {
    setLoading(false);
  }
};

  if (!open) return null;

  const isSignup = type === "signup";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-[92%] sm:w-[560px] rounded-2xl shadow-2xl bg-white overflow-hidden transition-all duration-200 ${
          animateIn ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-2"
        }`}
      >
        <div className="px-6 py-5 bg-gradient-to-r from-[#EE4C7C] to-[#ff86ad]">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-white text-xl font-semibold">
                {isSignup ? "Registrácia" : "Prihlásenie"}
              </h3>
              <p className="text-white/90 text-sm mt-1">
                {isSignup ? "Vytvorte si účet a nakupujte rýchlejšie" : "Vitajte späť, prihláste sa do svojho účtu"}
              </p>
            </div>
            <button
              aria-label="Zavrieť"
              onClick={onClose}
              className="p-2 rounded-lg cursor-pointer hover:bg-white/10 text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}
          <form ref={formRef} onSubmit={handleSubmit}>
            {isSignup && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1">
                  <span className="text-sm text-gray-700">Meno</span>
                  <div className="relative">
                    <User className="h-4 w-4 text-[#EE4C7C] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      name="firstName"
                      required
                      disabled={loading}
                      className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#EE4C7C] disabled:opacity-50"
                      placeholder="Ján"
                    />
                  </div>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm text-gray-700">Priezvisko</span>
                  <div className="relative">
                    <User className="h-4 w-4 text-[#EE4C7C] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      name="lastName"
                      required
                      disabled={loading}
                      className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#EE4C7C] disabled:opacity-50"
                      placeholder="Novák"
                    />
                  </div>
                </label>
              </div>
            )}

            <div className={`${isSignup ? 'mt-4' : ''} grid grid-cols-1 gap-4`}>
              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-700">E‑mail</span>
                <div className="relative">
                  <Mail className="h-4 w-4 text-[#EE4C7C] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    name="email"
                    required
                    type="email"
                    disabled={loading}
                    className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#EE4C7C] disabled:opacity-50"
                    placeholder="jan.novak@example.com"
                  />
                </div>
              </label>

              {isSignup && (
                <label className="flex flex-col gap-1">
                  <span className="text-sm text-gray-700">Telefón (voliteľné)</span>
                  <div className="relative">
                    <User className="h-4 w-4 text-[#EE4C7C] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      name="phone"
                      type="tel"
                      disabled={loading}
                      className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#EE4C7C] disabled:opacity-50"
                      placeholder="+421 900 123 456"
                    />
                  </div>
                </label>
              )}

              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-700">Heslo</span>
                <div className="relative">
                  <Lock className="h-4 w-4 text-[#EE4C7C] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    name="password"
                    required
                    type="password"
                    disabled={loading}
                    minLength={6}
                    className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#EE4C7C] disabled:opacity-50"
                    placeholder="••••••••"
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 cursor-pointer bg-[#EE4C7C] hover:bg-[#d9446f] text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Spracováva sa...' : (isSignup ? "Zaregistrovať sa" : "Prihlásiť sa")}
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="h-px bg-gray-200 flex-1" />
                <span className="text-xs text-gray-500">alebo</span>
                <div className="h-px bg-gray-200 flex-1" />
              </div>

              <button 
                type="button"
                disabled={loading}
                onClick={handleGoogleSignIn}
                className="cursor-pointer border border-gray-300 hover:bg-gray-50 rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24 s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,14,24,14c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.197l-6.196-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.513,5.023C9.505,39.556,16.227,44,24,44z"/>
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.793,2.237-2.231,4.166-3.994,5.565 c0.001-0.001,0.002-0.001,0.003-0.002l6.196,5.238C35.271,40.252,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                </svg>
                Google
              </button>

              <p className="text-xs text-gray-500 mt-3">
                Pokračovaním súhlasíte s našimi <a className="text-[#EE4C7C] hover:underline" href="#">Podmienkami</a> a <a className="text-[#EE4C7C] hover:underline" href="#">Zásadami ochrany súkromia</a>.
              </p>

              <div className="mt-3 text-sm text-gray-700">
                {isSignup ? (
                  <span>
                    Máte účet?{' '}
                    <button
                      type="button"
                      className="text-[#EE4C7C] hover:underline cursor-pointer"
                      onClick={() => (onSwitchType ? onSwitchType("login") : onClose())}
                    >
                      Prihláste sa
                    </button>
                  </span>
                ) : (
                  <span>
                    Nemáte účet?{' '}
                    <button
                      type="button"
                      className="text-[#EE4C7C] hover:underline cursor-pointer"
                      onClick={() => (onSwitchType ? onSwitchType("signup") : onClose())}
                    >
                      Zaregistrujte sa
                    </button>
                  </span>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
