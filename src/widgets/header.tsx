'use client';

import { Search, ShoppingCart, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-20">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            </div>
            <span className="ml-3 text-2xl font-bold uppercase text-orange-500">Teta Márgit</span>
          </div>

          <nav className="hidden md:flex space-x-8">
            <a href="#home" className="text-black hover:text-orange-500 transition-colors">Domov</a>
            <a href="#products" className="text-black hover:text-orange-500 transition-colors">Produkty</a>
            <a href="#about" className="text-black hover:text-orange-500 transition-colors">O nás</a>
            <a href="#contact" className="text-black hover:text-orange-500 transition-colors">Kontakt</a>
          </nav>

            <button className="relative p-2 text-black cursor-pointer hover:text-orange-500 transition-colors">
              <ShoppingCart className="cursor-pointer h-6 w-6" />
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
            </button>

          {/* Мобильное меню */}
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

        {/* Мобильное меню */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <a href="#home" className="text-black hover:text-orange-500 transition-colors">Domov</a>
              <a href="#products" className="text-black hover:text-orange-500 transition-colors">Produkty</a>
              <a href="#about" className="text-black hover:text-orange-500 transition-colors">O nás</a>
              <a href="#contact" className="text-black hover:text-orange-500 transition-colors">Kontakt</a>
            </nav>
            <div className="mt-4 space-y-2">
              <input
                type="text"
                placeholder="Hľadať produkty..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button className="w-full flex items-center cursor-pointer justify-center p-2 text-black hover:text-orange-500 transition-colors">
                <ShoppingCart className="cursor-pointer h-6 w-6 mr-2" />
                Košík (3)
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}