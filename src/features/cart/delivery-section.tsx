"use client";

import { Dispatch, SetStateAction } from "react";
import { Truck, Store, MapPin, Home, Building2, Phone, User, Mail, FileText } from "lucide-react";

export type DeliveryMethod = "pickup" | "courier";

interface DeliverySectionProps {
	deliveryMethod: DeliveryMethod;
	setDeliveryMethod: Dispatch<SetStateAction<DeliveryMethod>>;
}

export function DeliverySection({ deliveryMethod, setDeliveryMethod }: DeliverySectionProps) {
	return (
		<section className="bg-white shadow rounded-xl p-6">
			<h2 className="text-xl font-semibold mb-4 text-black flex items-center gap-2"><Truck className="h-5 w-5 text-orange-500" /> Spôsob doručenia</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<button onClick={() => setDeliveryMethod("pickup")} className={`${deliveryMethod === "pickup" ? "border-orange-500 ring-2 ring-orange-200" : "border-gray-200"} cursor-pointer rounded-lg border p-4 text-left transition focus:outline-none`}>
					<div className="flex items-center justify-between">
						<span className="text-black font-medium flex items-center gap-2"><Store className="h-5 w-5 text-orange-500" /> Osobný odber</span>
						<span className={`text-xs px-2 py-1 rounded ${deliveryMethod === "pickup" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-700"}`}>vybraté</span>
					</div>
					<p className="text-gray-600 mt-2">Zdarma. Vyzdvihnutie dnes v predajni.</p>
				</button>
				<button onClick={() => setDeliveryMethod("courier")} className={`${deliveryMethod === "courier" ? "border-orange-500 ring-2 ring-orange-200" : "border-gray-200"} cursor-pointer rounded-lg border p-4 text-left transition focus:outline-none`}>
					<div className="flex items-center justify-between">
						<span className="text-black font-medium flex items-center gap-2"><Truck className="h-5 w-5 text-orange-500" /> Doručenie kuriérom</span>
						<span className={`text-xs px-2 py-1 rounded ${deliveryMethod === "courier" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-700"}`}>vybraté</span>
					</div>
					<p className="text-gray-600 mt-2">Zajtra, 4.99€ v rámci mesta.</p>
				</button>
			</div>
			{deliveryMethod === "courier" && (
				<div className="mt-6 border-t pt-6">
					<h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2"><MapPin className="h-5 w-5 text-orange-500" /> Adresa doručenia</h3>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<label className="flex flex-col gap-1">
							<span className="text-sm text-gray-700 flex items-center gap-2"><User className="h-4 w-4 text-orange-500" /> Meno a priezvisko</span>
							<input className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Ján Novák" />
						</label>
						<label className="flex flex-col gap-1">
							<span className="text-sm text-gray-700 flex items-center gap-2"><Phone className="h-4 w-4 text-orange-500" /> Telefón</span>
							<input className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="+421 900 123 456" />
						</label>
						<label className="flex flex-col gap-1 sm:col-span-2">
							<span className="text-sm text-gray-700 flex items-center gap-2"><Mail className="h-4 w-4 text-orange-500" /> E‑mail (voliteľné)</span>
							<input className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="jan.novak@example.com" />
						</label>
						<label className="flex flex-col gap-1 sm:col-span-2">
							<span className="text-sm text-gray-700 flex items-center gap-2"><Home className="h-4 w-4 text-orange-500" /> Ulica a číslo</span>
							<input className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Hlavná 12" />
						</label>
						<label className="flex flex-col gap-1">
							<span className="text-sm text-gray-700 flex items-center gap-2"><Building2 className="h-4 w-4 text-orange-500" /> Mesto</span>
							<input className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Bratislava" />
						</label>
						<label className="flex flex-col gap-1">
							<span className="text-sm text-gray-700 flex items-center gap-2"><FileText className="h-4 w-4 text-orange-500" /> PSČ</span>
							<input className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="811 01" />
						</label>
						<label className="flex flex-col gap-1 sm:col-span-2">
							<span className="text-sm text-gray-700 flex items-center gap-2"><FileText className="h-4 w-4 text-orange-500" /> Poznámka pre kuriéra (voliteľné)</span>
							<textarea className="border border-gray-300 rounded-lg px-3 py-2 min-h-[88px] focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Dvere č. 5, zvoniť na Novák"></textarea>
						</label>
					</div>
				</div>
			)}
		</section>
	);
} 