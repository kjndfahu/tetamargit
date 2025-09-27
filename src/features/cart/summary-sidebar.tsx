"use client";

import { FileText } from "lucide-react";
import { CartSummary } from "@/lib/cart";

interface SummarySidebarProps {
	cartSummary: CartSummary;
	deliveryMethod: "pickup" | "courier";
	onCheckout: () => void;
	paymentMethod: "card" | "cash";
	isProcessing?: boolean;
}

export function SummarySidebar({ cartSummary, deliveryMethod, onCheckout, paymentMethod, isProcessing = false }: SummarySidebarProps) {
	const deliveryFee = deliveryMethod === "courier" ? 4.99 : 0;
	const total = cartSummary.subtotal + deliveryFee;

	return (
		<aside className="lg:col-span-1">
			<div className="bg-white shadow rounded-xl p-6">
				<h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2"><FileText className="h-5 w-5 text-[#EE4C7C]" /> Spolu</h3>
				<div className="space-y-2 text-black">
					<div className="flex justify-between">
						<span>Produkty ({cartSummary.itemCount} ks)</span>
						<span>{cartSummary.subtotal.toFixed(2)}€</span>
					</div>
					<div className="flex justify-between">
						<span>Doručenie</span>
						<span>{deliveryFee.toFixed(2)}€</span>
					</div>
					<div className="flex justify-between font-semibold border-t pt-2">
						<span>Na zaplatenie</span>
						<span>{total.toFixed(2)}€</span>
					</div>
				</div>
				<button 
					onClick={onCheckout} 
					disabled={cartSummary.itemCount === 0 || isProcessing}
					className="w-full mt-6 cursor-pointer bg-[#EE4C7C] hover:bg-[#9A1750] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
				>
					<FileText className="h-5 w-5" /> 
					{isProcessing ? 'Spracovávam objednávku...' : 'Dokončiť objednávku'}
				</button>
				<p className="text-xs text-gray-600 mt-3">
					Platba: {paymentMethod === "card" ? "kartou online" : "v hotovosti pri prevzatí"}.
				</p>
			</div>
		</aside>
	);
} 
