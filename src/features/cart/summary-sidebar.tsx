"use client";

import { FileText } from "lucide-react";

interface SummarySidebarProps {
	deliveryMethod: "pickup" | "courier";
	onCheckout: () => void;
	paymentMethod: "card" | "cash";
}

export function SummarySidebar({ deliveryMethod, onCheckout, paymentMethod }: SummarySidebarProps) {
	return (
		<aside className="lg:col-span-1">
			<div className="bg-white shadow rounded-xl p-6">
				<h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2"><FileText className="h-5 w-5 text-[#EE4C7C]" /> Spolu</h3>
				<div className="space-y-2 text-black">
					<div className="flex justify-between"><span>Produkty</span><span>31.50€</span></div>
					<div className="flex justify-between"><span>Doručenie</span><span>{deliveryMethod === "courier" ? "4.99€" : "0.00€"}</span></div>
					<div className="flex justify-between font-semibold border-t pt-2"><span>Na zaplatenie</span><span>{deliveryMethod === "courier" ? "36.49€" : "31.50€"}</span></div>
				</div>
				<button onClick={onCheckout} className="w-full mt-6 cursor-pointer bg-[#EE4C7C] hover:bg-[#9A1750] text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2">
					<FileText className="h-5 w-5" /> Dokončiť objednávku
				</button>
				<p className="text-xs text-gray-600 mt-3">
					Platba: {paymentMethod === "card" ? "kartou online" : "v hotovosti pri prevzatí"}.
				</p>
			</div>
		</aside>
	);
} 