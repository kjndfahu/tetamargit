'use client';

import { useState } from 'react';
import { ShoppingCart, Info, Clock, Users } from 'lucide-react';

const flipCards = [
  {
    id: 1,
    front: {
      title: 'Domáca zeleninová polievka',
      subtitle: 'Tradičný recept našej tety',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop',
    },
    back: {
      title: 'Zeleninová polievka',
      description: 'Výživná polievka plná čerstvých zelenín z našej záhrady. Ideálna pre chladné dni a posilnenie imunity.',
      ingredients: ['Mrkva', 'Zeler', 'Petržlen', 'Cibuľa', 'Cesnak', 'Bylinky'],
      instructions: 'Zeleninu nakrájajte na kocky, orestujte cibuľu, pridajte vodu a bylinky. Varite 45 minút.',
      time: '45 min',
      servings: '4 osoby',
      difficulty: 'Ľahké',
      price: 'od 2,50€'
    }
  },
  {
    id: 2,
    front: {
      title: 'Domáce ovocné koláče',
      subtitle: 'Sladké pečivo s čerstvým ovocím',
      image: 'https://images.unsplash.com/photo-1619566636858-adf3ef4644b9?w=400&h=400&fit=crop'
    },
    back: {
      title: 'Ovocné koláče',
      description: 'Jemné koláče plné čerstvého ovocia z našej záhrady. Tradičný recept, ktorý sa odovzdáva z generácie na generáciu.',
      ingredients: ['Múka', 'Maslo', 'Vajcia', 'Cukor', 'Čerstvé ovocie', 'Vanilka'],
      instructions: 'Vypracujte cesto, rozvaľte, naplňte ovocím a pečte 25 minút pri 180°C.',
      time: '25 min',
      servings: '6 kusov',
      difficulty: 'Stredné',
      price: 'od 1,80€'
    }
  },
  {
    id: 3,
    front: {
      title: 'Domáce mliečne výrobky',
      subtitle: 'Tradičné recepty našich predkov',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop',
    },
    back: {
      title: 'Domáce jogurty a syry',
      description: 'Čerstvé mliečne výrobky vyrobené podľa tradičných receptov. Bez umelých prísad a konzervantov.',
      ingredients: ['Čerstvé mlieko', 'Jogurtová kultúra', 'Sýrenina', 'Soľ', 'Bylinky'],
      instructions: 'Mlieko zahrejte na 42°C, pridajte kultúru, nechajte 8 hodín. Pre syry pridajte sýreninu.',
      time: '8 hod',
      servings: '1 liter',
      difficulty: 'Stredné',
      price: 'od 3,20€'
    }
  },
  {
    id: 4,
    front: {
      title: 'Domáce mäsové špeciality',
      subtitle: 'Kvalitné mäso od farmárov',
      image: 'https://images.unsplash.com/photo-1607623814075-e51df1616ee7?w=400&h=400&fit=crop'
    },
    back: {
      title: 'Domáce klobásy a salámy',
      description: 'Tradičné mäsové výrobky vyrobené z kvalitného mäsa našich farmárov. Bez umelých prísad.',
      ingredients: ['Kvalitné mäso', 'Soľ', 'Korenie', 'Cesnak', 'Bylinky', 'Prirodzené obaly'],
      instructions: 'Mäso pomelieme, pridáme korenie, plníme do obalov a necháme 24 hodín odležať.',
      time: '24 hod',
      servings: '2 kg',
      difficulty: 'Náročné',
      price: 'od 8,50€'
    }
  }
];

export function FlipCards() {
  const [flippedCards, setFlippedCards] = useState<number[]>([]);

  const toggleCard = (cardId: number) => {
    setFlippedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  return (
    <section className="">
      <div className="mx-auto px-4 sm:px-6 lg:px-20">
        <div className="text-center mb-25">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Tradičné recepty našej tety Márgit
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Kliknite na kartu a dozviete sa o našich domácich receptoch a tradičných jedlách
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {flipCards.map((card) => (
            <div key={card.id} className="relative h-100 perspective-1000">
              <div
                className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${
                  flippedCards.includes(card.id) ? 'rotate-y-180' : ''
                }`}
                onClick={() => toggleCard(card.id)}
              >
                <div className="absolute inset-0 w-full h-full backface-hidden">
                  <div className="bg-white rounded-xl shadow-lg h-full overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={card.front.image}
                        alt={card.front.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                      <div className="absolute bottom-4 left-4 text-white text-sm font-medium">
                        Kliknite pre recept
                      </div>
                    </div>

                    <div className="p-6 text-center">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {card.front.title}
                      </h3>
                      <p className="text-gray-600">
                        {card.front.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
                  <div className="bg-gradient-to-br from-[#8B4513] to-[#2C1810] rounded-xl shadow-lg h-full p-6 text-white overflow-y-auto">
                    <h3 className="text-xl font-bold mb-3 text-center">
                      {card.back.title}
                    </h3>

                    <p className="text-sm mb-4 text-[#F5F5DC] leading-relaxed">
                      {card.back.description}
                    </p>

                    <div className="mb-4">
                      <h4 className="font-semibold mb-2 text-[#D4AF37]">Ingrediencie:</h4>
                      <ul className="space-y-1">
                        {card.back.ingredients.map((ingredient, index) => (
                          <li key={index} className="text-xs text-[#F5F5DC] flex items-center">
                            <span className="w-2 h-2 bg-[#D4AF37] rounded-full mr-2"></span>
                            {ingredient}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold mb-2 text-[#D4AF37]">Postup:</h4>
                      <p className="text-xs text-[#F5F5DC] leading-relaxed">
                        {card.back.instructions}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center text-xs">
                        <Clock className="w-3 h-3 text-[#D4AF37] mr-1" />
                        <span className="text-[#F5F5DC]">{card.back.time}</span>
                      </div>
                      <div className="flex items-center text-xs">
                        <Users className="w-3 h-3 text-[#D4AF37] mr-1" />
                        <span className="text-[#F5F5DC]">{card.back.servings}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="text-xs bg-[#D4AF37] text-[#2C1810] px-2 py-1 rounded-full">
                        {card.back.difficulty}
                      </span>
                    </div>

                    <div className="mb-4">
                      <span className="text-lg font-bold text-[#D4AF37]">
                        {card.back.price}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      <button className="flex-1 bg-white text-[#2C1810] hover:bg-gray-100 font-semibold py-2 px-3 rounded-lg text-sm transition-colors duration-300 flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Do košíka
                      </button>
                    </div>

                    <div className="text-center mt-3 text-xs text-[#D4AF37]">
                      Kliknite pre návrat
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-2 bg-white rounded-full px-6 py-3 shadow-lg">
            <Info className="w-5 h-5 text-[#8B4513]" />
            <span className="text-gray-700 font-medium">
              Všetky recepty sú testované a odporúčané našou tetou Márgit
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

