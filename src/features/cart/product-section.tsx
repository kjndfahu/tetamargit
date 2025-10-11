"use client";

import { Package } from "lucide-react";

export function ProductsSection() {
	return (
		<section className="bg-white shadow rounded-xl p-6">
			<h2 className="text-xl font-semibold mb-4 text-black flex items-center gap-2"><Package className="h-5 w-5 text-[#EE4C7C]" /> Produkty</h2>
			<div className="divide-y divide-gray-200">
				{[1, 2, 3].map((id) => (
					<div key={id} className="py-4 flex items-center justify-between">
						<div>
							<p className="text-black font-medium">Produkt {id}</p>
							<p className="text-gray-600 text-sm">Krátky popis</p>
						</div>
						<div className="text-black font-semibold">{(id * 3.5).toFixed(2)}€</div>
					</div>
				))}
			</div>
		</section>
	);
} 