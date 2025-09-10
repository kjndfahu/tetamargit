import Image from 'next/image';

export function Footer() {
  return (
    <footer className="border-gray-200 mt-[80px] border-t-[1px] text-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-20 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <Image width={60} height={60} src="/img/logo-teta.svg" alt="logo" />
              <span className="ml-2 text-xl font-bold">Teta Márgit</span>
            </div>
            <p className="text-gray-900 mb-4">
              Ponúkame len najčerstvejšie a najkvalitnejšie produkty pre váš stôl. 
              Našou misiou je zabezpečiť vám zdravé stravovanie každý deň.
            </p>

          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#EE4C7C]">Rýchle odkazy</h3>
            <ul className="space-y-2">
              <li><a href="#home" className="text-gray-900 hover:text-[#EE4C7C] transition-colors">Domov</a></li>
              <li><a href="#products" className="text-gray-900 hover:text-[#EE4C7C] transition-colors">Produkty</a></li>
              <li><a href="#about" className="text-gray-900 hover:text-[#EE4C7C] transition-colors">O nás</a></li>
              <li><a href="#contact" className="text-gray-900 hover:text-[#EE4C7C] transition-colors">Kontakt</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#EE4C7C]">Kontakt</h3>
            <div className="space-y-2 text-gray-900">
              <p>📞 +421 (999) 123-45-67</p>
              <p>📧 info@tetamargit.sk</p>
              <p>📍 ul. Čerstvá, 15, Bratislava</p>
              <p>🕒 Po-Ne: 8:00 - 22:00</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-900">
          <p>&copy; 2025 Teta Márgit. Všetky práva vyhradené.</p>
        </div>
      </div>
    </footer>
  );
}