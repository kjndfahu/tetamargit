"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useProduct } from "@/hooks/useProducts";
import { useCartStore } from "@/stores/cart";
import { ProductService } from "@/lib/products";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const { product, loading, error } = useProduct(id || "");
  const addToCart = useCartStore(state => state.addToCart);

  // рекомендации из БД
  const [suggestions, setSuggestions] = useState<any[]>([]);
  useEffect(() => {
    const load = async () => {
      const items = await ProductService.getRandomProducts(4, id);
      setSuggestions(items);
    };
    if (id) load();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart({ product_id: product.id, quantity: 1, price: product.price });
  };

  if (loading) {
    return (
      <main className="px-4 sm:px-6 lg:px-20 py-10 w-full">
        <p className="text-gray-600">Načítavam produkt...</p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="px-4 sm:px-6 lg:px-20 py-10 w-full">
        <p className="text-red-600">Produkt sa nepodarilo načítať.</p>
        <button onClick={() => router.back()} className="mt-4 inline-flex items-center gap-2 text-[#EE4C7C] hover:text-[#9A1750]">
          ← Vrátiť sa späť
        </button>
      </main>
    );
  }

  return (
    <main className="px-4 sm:px-6 lg:px-20 py-10 w-full">
      <button onClick={() => router.back()} className="mb-6 inline-flex items-center gap-2 text-[#EE4C7C] hover:text-[#9A1750]">
        ← Vrátiť sa späť
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-xl shadow p-6">
        <div className="w-full aspect-square overflow-hidden rounded-lg bg-gray-100">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">Bez obrázka</div>
          )}
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description || "Bez popisu"}</p>
          <div className="text-xl font-semibold text-gray-900 mb-6">{product.price?.toFixed(2)} €</div>
          <button
            onClick={handleAddToCart}
            className="bg-[#EE4C7C] hover:bg-[#9A1750] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Pridať do košíka
          </button>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Odporúčané pre vás</h2>
        {suggestions.length === 0 ? (
          <p className="text-gray-500">Žiadne odporúčania</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {suggestions.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                className="group block bg-white rounded-xl shadow hover:shadow-lg transition-all"
              >
                <div className="relative overflow-hidden rounded-t-xl">
                  <img
                    src={p.image_url || "products.svg"}
                    alt={p.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#EE4C7C] transition-colors">{p.name}</h3>
                  <div className="text-gray-700 font-medium">{p.price?.toFixed(2)} €</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}


