'use client';

import Image from 'next/image';
import { Search, ShoppingCart, Menu, X, UserPlus, LogIn, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AuthModal } from '@/features/auth/auth-modal';
import { useAuth } from '@/hooks/useAuth';
import { useCartItemCount } from '@/hooks/useCart';
import { useCartStore } from '@/stores/cart';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openAuth, setOpenAuth] = useState(false);
  const [authType, setAuthType] = useState<'signup' | 'login'>('signup');
  const { user, profile, loading, signOut, isAuthenticated } = useAuth();
  const { itemCount: serverItemCount, loading: cartLoading } = useCartItemCount();
  const zustandItemCount = useCartStore(state => state.itemCount);
  const setZustandItemCount = useCartStore(state => state.setItemCount);
  
  // Синхронизируем Zustand счетчик с серверным при загрузке
  useEffect(() => {
    if (!cartLoading && serverItemCount !== undefined) {
      setZustandItemCount(serverItemCount);
    }
  }, [serverItemCount, cartLoading, setZustandItemCount]);
  
  // Используем Zustand счетчик
  const itemCount = zustandItemCount;

  // Prevent cart navigation if not authenticated
  const handleCartClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setAuthType('login');
      setOpenAuth(true);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-20">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <div className="flex cursor-pointer items-center">
              <Image width={830/17.5} height={60} src="/img/logo.png" alt="logo" />
              <span className="ml-3 text-2xl font-bold uppercase text-[#EE4C7C]">Teta Márgit</span>
            </div>
          </Link>

          <nav className="hidden md:flex space-x-8">
            <a href="#home" className="text-black hover:text-[#EE4C7C] transition-colors">Domov</a>
            <a href="#products" className="text-black hover:text-[#EE4C7C] transition-colors">Produkty</a>
            <a href="#about" className="text-black hover:text-[#EE4C7C] transition-colors">O nás</a>
            <a href="#contact" className="text-black hover:text-[#EE4C7C] transition-colors">Kontakt</a>
          </nav>

            <div className="flex items-center gap-2">
              {!loading && (
                <>
                  {isAuthenticated ? (
                    <div className="hidden sm:flex items-center gap-2">
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-black">
                        <User className="h-4 w-4 text-[#EE4C7C]" />
                        <span className="text-sm">
                          {profile?.first_name ? `${profile.first_name} ${profile.last_name}` : user?.email}
                        </span>
                      </div>
                      <button 
                        onClick={handleSignOut}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-black hover:border-[#EE4C7C] hover:text-[#EE4C7C] transition-colors cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" /> Odhlásiť sa
                      </button>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => { setAuthType('signup'); setOpenAuth(true); }} className="hidden sm:inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-black hover:border-[#EE4C7C] hover:text-[#EE4C7C] transition-colors cursor-pointer">
                        <UserPlus className="h-4 w-4" /> Registrácia
                      </button>
                      <button onClick={() => { setAuthType('login'); setOpenAuth(true); }} className="hidden sm:inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-black hover:border-[#EE4C7C] hover:text-[#EE4C7C] transition-colors cursor-pointer">
                        <LogIn className="h-4 w-4" /> Prihlásenie
                      </button>
                    </>
                  )}
                </>
              )}
              <a
                href="/cart"
                onClick={handleCartClick}
                className="relative p-2 text-black cursor-pointer hover:text-[#EE4C7C] transition-colors"
              >
                <ShoppingCart className="cursor-pointer h-6 w-6" />
                {!cartLoading && itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#EE4C7C] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </a>
              <button 
                data-auth-login
                onClick={() => { setAuthType('login'); setOpenAuth(true); }} 
                className="hidden"
              >
                Hidden Login Trigger
              </button>
            </div>

          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-black" />
            ) : (
              <Menu className="h-6 w-6 text-black" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <a href="#home" className="text-black hover:text-[#EE4C7C] transition-colors">Domov</a>
              <a href="#products" className="text-black hover:text-[#EE4C7C] transition-colors">Produkty</a>
              <a href="#about" className="text-black hover:text-[#EE4C7C] transition-colors">O nás</a>
              <a href="#contact" className="text-black hover:text-[#EE4C7C] transition-colors">Kontakt</a>
            </nav>
            <div className="mt-4 space-y-2">
              <input
                type="text"
                placeholder="Hľadať produkty..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4C7C] focus:border-transparent"
              />
              <a
                href="/cart"
                onClick={handleCartClick}
                className="w-full flex items-center cursor-pointer justify-center p-2 text-black hover:text-[#EE4C7C] transition-colors"
              >
                <ShoppingCart className="cursor-pointer h-6 w-6 mr-2" />
                Košík {!cartLoading && itemCount > 0 ? `(${itemCount})` : ''}
              </a>
              {!loading && (
                <>
                  {isAuthenticated ? (
                    <>
                      <div className="w-full flex items-center justify-center gap-2 p-2 text-black">
                        <User className="h-5 w-5 text-[#EE4C7C]" />
                        <span className="text-sm">
                          {profile?.first_name ? `${profile.first_name} ${profile.last_name}` : user?.email}
                        </span>
                      </div>
                      <button 
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center gap-2 p-2 text-black hover:text-[#EE4C7C] transition-colors cursor-pointer"
                      >
                        <LogOut className="h-5 w-5" /> Odhlásiť sa
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setAuthType('signup'); setOpenAuth(true); }} className="w-full flex items-center justify-center gap-2 p-2 text-black hover:text-[#EE4C7C] transition-colors cursor-pointer">
                        <UserPlus className="h-5 w-5" /> Registrácia
                      </button>
                      <button onClick={() => { setAuthType('login'); setOpenAuth(true); }} className="w-full flex items-center justify-center gap-2 p-2 text-black hover:text-[#EE4C7C] transition-colors cursor-pointer">
                        <LogIn className="h-5 w-5" /> Prihlásenie
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {!isAuthenticated && (
        <AuthModal open={openAuth} onClose={() => setOpenAuth(false)} type={authType} onSwitchType={(t) => setAuthType(t)} />
      )}
    </header>
  );
}
