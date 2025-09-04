"use client";

import { Dispatch, SetStateAction } from "react";
import { CreditCard, Wallet } from "lucide-react";

export type PaymentMethod = "card" | "cash";

interface PaymentSectionProps {
	paymentMethod: PaymentMethod;
	setPaymentMethod: Dispatch<SetStateAction<PaymentMethod>>;
}

export function PaymentSection({ paymentMethod, setPaymentMethod }: PaymentSectionProps) {
	return (
		<section className="bg-white shadow rounded-xl p-6">
			<h2 className="text-xl font-semibold mb-4 text-black flex items-center gap-2"><CreditCard className="h-5 w-5 text-orange-500" /> Platba</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<button onClick={() => setPaymentMethod("card")} className={`${paymentMethod === "card" ? "border-orange-500 ring-2 ring-orange-200" : "border-gray-200"} cursor-pointer rounded-lg border p-4 text-left transition focus:outline-none`}>
					<div className="flex items-center justify-between">
						<span className="text-black font-medium flex items-center gap-2"><CreditCard className="h-5 w-5 text-orange-500" /> Kartou</span>
						<span className={`text-xs px-2 py-1 rounded ${paymentMethod === "card" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-700"}`}>vybraté</span>
					</div>
					<p className="text-gray-600 mt-2">Visa, MasterCard, Apple Pay.</p>
				</button>
				<button onClick={() => setPaymentMethod("cash")} className={`${paymentMethod === "cash" ? "border-orange-500 ring-2 ring-orange-200" : "border-gray-200"} cursor-pointer rounded-lg border p-4 text-left transition focus:outline-none`}>
					<div className="flex items-center justify-between">
						<span className="text-black font-medium flex items-center gap-2"><Wallet className="h-5 w-5 text-orange-500" /> V hotovosti</span>
						<span className={`text-xs px-2 py-1 rounded ${paymentMethod === "cash" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-700"}`}>vybraté</span>
					</div>
					<p className="text-gray-600 mt-2">Platba pri prevzatí.</p>
				</button>
			</div>
		</section>
	);
} 