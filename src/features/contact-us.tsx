'use client';

import { useState, useRef } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';

const contactInfo = [
  {
    icon: Phone,
    title: 'Telefón',
    value: '+421 (999) 123-45-67',
    subtitle: 'Po-Ne: 8:00 - 22:00',
    color: 'text-green-500',
    bgColor: 'bg-green-50'
  },
  {
    icon: Mail,
    title: 'Email',
    value: 'info@tetamargit.sk',
    subtitle: 'Odpovieme do 2 hodín',
    color: 'text-[#EE4C7C]',
    bgColor: 'bg-[#E3AFBC]/20'
  },
  {
    icon: MapPin,
    title: 'Adresa',
    value: 'ul. Čerstvá, 15, Bratislava',
    subtitle: 'Metro "Čerstvá"',
    color: 'text-[#9A1750]',
    bgColor: 'bg-[#E3AFBC]/30'
  },
  {
    icon: Clock,
    title: 'Otvorené hodiny',
    value: 'Denne',
    subtitle: '8:00 - 22:00',
    color: 'text-[#5D001E]',
    bgColor: 'bg-[#E3AFBC]/40'
  }
];

export function ContactUs() {
  const form = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

    console.log('Odosielame formulár:', formData);

    setIsLoading(true);

    try {
      await emailjs.sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
        form.current!,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || ''
      );
      console.log('Email sent successfully');

      setIsSubmitted(true);

      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      }, 3000);
      
    } catch (error) {
      console.error('Email sending failed:', error);
    } finally {
      setIsLoading(false);
    }    
  };

  return (
    <section id="contact">
      <div className=" mx-auto px-4 sm:px-6 lg:px-20">
        <div className="text-center mb-25">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Kontaktujte nás
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Máte nejaké otázky? Sme vždy pripravení pomôcť! Kontaktujte nás akýmkoľvek vhodným spôsobom.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          <div>
            <div className="space-y-6 mb-8">
              {contactInfo.map((info, index) => (
                <div key={index} className={`flex items-start space-x-4 p-4 rounded-xl ${info.bgColor}`}>
                  <div className={`p-3 rounded-lg bg-white shadow-sm`}>
                    <info.icon className={`w-6 h-6 ${info.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{info.title}</h3>
                    <p className="text-gray-700 font-medium">{info.value}</p>
                    <p className="text-sm text-gray-500">{info.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
            

          </div>

          <div>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Odoslať správu</h3>
              
              {isSubmitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">Správa odoslaná!</h4>
                  <p className="text-gray-600">Čoskoro vás budeme kontaktovať.</p>
                </div>
              ) : (
                <form ref={form} onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Meno *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4C7C] focus:border-transparent"
                        placeholder="Vaše meno"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4C7C] focus:border-transparent"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Telefónne číslo
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4C7C] focus:border-transparent"
                        placeholder="+421 (999) 123-45-67"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Téma *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4C7C] focus:border-transparent"
                      >
                        <option value="">Vyberte tému</option>
                        <option value="order">Otázka ohľadom objednávky</option>
                        <option value="delivery">Doručenie</option>
                        <option value="quality">Kvalita produktu</option>
                        <option value="partnership">Spolupráca</option>
                        <option value="other">Iné</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Správa *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4C7C] focus:border-transparent resize-none"
                      placeholder="Opíšte vašu otázku alebo návrh..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#EE4C7C] cursor-pointer hover:bg-[#9A1750] text-white font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                  >
                    <Send className="w-5 h-5" />
                    <span>Posielajte správy</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


