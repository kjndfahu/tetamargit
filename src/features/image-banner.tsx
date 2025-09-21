'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/config/supabase';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image_path: string;
  display_order: number;
  is_active: boolean;
  image_url?: string;
}

export function ImageBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        throw error;
      }

      const bannersWithImages = data.map(banner => ({
        ...banner,
        image_url: supabase.storage.from('Banners').getPublicUrl(banner.image_path).data.publicUrl
      }));

      setBanners(bannersWithImages);
      setError(null);
    } catch (err) {
      console.error('Error fetching banners:', err);
      setError('Nepodarilo sa načítať bannery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners.length]);

  const goToPrevious = () => {
    setCurrentSlideIndex((prev) => 
      prev === 0 ? banners.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % banners.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlideIndex(index);
  };

  if (loading) {
    return (
      <section className="relative h-96 overflow-hidden bg-gray-600">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-xl">Načítavanie...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative h-96 overflow-hidden bg-gray-600">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <p className="text-xl">{error}</p>
            <button 
              onClick={fetchBanners}
              className="mt-4 px-4 py-2 bg-white text-gray-800 rounded hover:bg-gray-100"
            >
              Skúsiť znova
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (banners.length === 0) {
    return (
      <section>
      </section>
    );
  }

  return (
    <section className="relative h-96 overflow-hidden bg-gray-600">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlideIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${banner.image_url})`,
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white relative z-10">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                {banner.title}
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 drop-shadow-md">
                {banner.subtitle}
              </p>
            </div>
          </div>
        </div>
      ))}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute cursor-pointer left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={goToNext}
            className="absolute cursor-pointer right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlideIndex
                    ? 'bg-white scale-125'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
