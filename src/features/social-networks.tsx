
import {  Instagram, Facebook, Twitter, Youtube } from 'lucide-react';
import Image from "next/image";

export function SocialNetworks() {
  return (
        <div className="text-center rounded-2xl px-8">
          <h3 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Sme na sociálnych sieťach!
          </h3>
          <p className="text-gray-600 mb-6">
            Získajte exkluzívne ponuky, zúčastnite sa súťaží a buďte prví, ktorí sa dozvedia o nových produktoch
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
                className="bg-gradient-to-r cursor-pointer from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold px-10 h-20 rounded-lg transition-all duration-300 flex items-center space-x-2">
              <Instagram className="w-5 h-5"/>
              <span>Instagram</span>
            </button>
            <button
                className="bg-gradient-to-r cursor-pointer from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-10 h-20 rounded-lg transition-all duration-300 flex items-center space-x-2">
              <Facebook className="w-5 h-5"/>
              <span>Facebook</span>
            </button>
            <button
                className="bg-gradient-to-r cursor-pointer from-black to-gray-700 hover:from-black hover:to-gray-900 text-white font-semibold px-10 h-20 rounded-lg transition-all duration-300 flex items-center space-x-2">
              <Image width={20} height={20} alt="logo" src="/img/tiktok.svg" className="w-5 h-5"/>
              <span>TikTok</span>
            </button>
          </div>
        </div>
  );
}


