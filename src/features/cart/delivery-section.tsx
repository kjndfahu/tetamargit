"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Truck, Store, MapPin, Home, Building2, Phone, User, Mail, FileText } from "lucide-react";
import { validators, useFormInputHandler } from '@/lib/shared/validators';

export type DeliveryMethod = "pickup" | "courier";

export interface DeliveryAddress {
	fullName: string;
	phone: string;
	email: string;
	street: string;
	city: string;
	postalCode: string;
	note: string;
}

interface DeliverySectionProps {
	deliveryMethod: DeliveryMethod;
	setDeliveryMethod: Dispatch<SetStateAction<DeliveryMethod>>;
	deliveryAddress: DeliveryAddress;
	setDeliveryAddress: Dispatch<SetStateAction<DeliveryAddress>>;
	errors: { [key: string]: string };
}

export function DeliverySection({ 
	deliveryMethod, 
	setDeliveryMethod, 
	deliveryAddress, 
	setDeliveryAddress,
	errors 
}: DeliverySectionProps) {
	const { handleInputChange } = useFormInputHandler();

	const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		handleInputChange(e, setDeliveryAddress);
	};

	return (
		<section className="bg-white shadow rounded-xl p-6">
			<h2 className="text-xl font-semibold mb-4 text-black flex items-center gap-2"><Truck className="h-5 w-5 text-[#EE4C7C]" /> Spôsob doručenia</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<button onClick={() => setDeliveryMethod("pickup")} className={`${deliveryMethod === "pickup" ? "border-[#EE4C7C] ring-2 ring-[#E3AFBC]/50" : "border-gray-200"} cursor-pointer rounded-lg border p-4 text-left transition focus:outline-none`}>
					<div className="flex items-center justify-between">
						<span className="text-black font-medium flex items-center gap-2"><Store className="h-5 w-5 text-[#EE4C7C]" /> Osobný odber</span>
						<span className={`text-xs px-2 py-1 rounded ${deliveryMethod === "pickup" ? "bg-[#EE4C7C] text-white" : "bg-gray-100 text-gray-700"}`}>vybraté</span>
					</div>
					<p className="text-gray-600 mt-2">Zdarma. Vyzdvihnutie dnes v predajni.</p>
				</button>
				<button onClick={() => setDeliveryMethod("courier")} className={`${deliveryMethod === "courier" ? "border-[#EE4C7C] ring-2 ring-[#E3AFBC]/50" : "border-gray-200"} cursor-pointer rounded-lg border p-4 text-left transition focus:outline-none`}>
					<div className="flex items-center justify-between">
						<span className="text-black font-medium flex items-center gap-2"><Truck className="h-5 w-5 text-[#EE4C7C]" /> Doručenie kuriérom</span>
						<span className={`text-xs px-2 py-1 rounded ${deliveryMethod === "courier" ? "bg-[#EE4C7C] text-white" : "bg-gray-100 text-gray-700"}`}>vybraté</span>
					</div>
					<p className="text-gray-600 mt-2">Zajtra, 4.99€ v rámci mesta.</p>
				</button>
			</div>
			{deliveryMethod === "courier" && (
				<div className="mt-6 border-t pt-6">
					<h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2"><MapPin className="h-5 w-5 text-[#EE4C7C]" /> Adresa doručenia</h3>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<label className="flex flex-col gap-1">
							<span className="text-sm text-gray-700 flex items-center gap-2"><User className="h-4 w-4 text-[#EE4C7C]" /> Meno a priezvisko</span>
							<input 
								name="fullName"
								value={deliveryAddress.fullName}
								onChange={handleAddressChange}
								className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#EE4C7C] ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`} 
								placeholder="Ján Novák" 
								required
							/>
							{errors.fullName && <span className="text-red-500 text-xs">{errors.fullName}</span>}
						</label>
						<label className="flex flex-col gap-1">
							<span className="text-sm text-gray-700 flex items-center gap-2"><Phone className="h-4 w-4 text-[#EE4C7C]" /> Telefón</span>
							<input 
								name="phone"
								value={deliveryAddress.phone}
								onChange={handleAddressChange}
								className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#EE4C7C] ${errors.phone ? 'border-red-500' : 'border-gray-300'}`} 
								placeholder="+421 900 123 456" 
								required
							/>
							{errors.phone && <span className="text-red-500 text-xs">{errors.phone}</span>}
						</label>
						<label className="flex flex-col gap-1 sm:col-span-2">
							<span className="text-sm text-gray-700 flex items-center gap-2"><Mail className="h-4 w-4 text-[#EE4C7C]" /> E‑mail *</span>
							<input 
								name="email"
								type="email"
								value={deliveryAddress.email}
								onChange={handleAddressChange}
								className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#EE4C7C] ${errors.email ? 'border-red-500' : 'border-gray-300'}`} 
								placeholder="jan.novak@example.com" 
								required
							/>
							{errors.email && <span className="text-red-500 text-xs">{errors.email}</span>}
						</label>
						<label className="flex flex-col gap-1 sm:col-span-2">
							<span className="text-sm text-gray-700 flex items-center gap-2"><Home className="h-4 w-4 text-[#EE4C7C]" /> Ulica a číslo</span>
							<input 
								name="street"
								value={deliveryAddress.street}
								onChange={handleAddressChange}
								className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#EE4C7C] ${errors.street ? 'border-red-500' : 'border-gray-300'}`} 
								placeholder="Hlavná 12" 
								required
							/>
							{errors.street && <span className="text-red-500 text-xs">{errors.street}</span>}
						</label>
						<label className="flex flex-col gap-1">
							<span className="text-sm text-gray-700 flex items-center gap-2"><Building2 className="h-4 w-4 text-[#EE4C7C]" /> Mesto</span>
							<input 
								name="city"
								value={deliveryAddress.city}
								onChange={handleAddressChange}
								className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#EE4C7C] ${errors.city ? 'border-red-500' : 'border-gray-300'}`} 
								placeholder="Bratislava" 
								required
							/>
							{errors.city && <span className="text-red-500 text-xs">{errors.city}</span>}
						</label>
						<label className="flex flex-col gap-1">
							<span className="text-sm text-gray-700 flex items-center gap-2"><FileText className="h-4 w-4 text-[#EE4C7C]" /> PSČ</span>
							<input 
								name="postalCode"
								value={deliveryAddress.postalCode}
								onChange={handleAddressChange}
								className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#EE4C7C] ${errors.postalCode ? 'border-red-500' : 'border-gray-300'}`} 
								placeholder="811 01" 
								required
							/>
							{errors.postalCode && <span className="text-red-500 text-xs">{errors.postalCode}</span>}
						</label>
						<label className="flex flex-col gap-1 sm:col-span-2">
							<span className="text-sm text-gray-700 flex items-center gap-2"><FileText className="h-4 w-4 text-[#EE4C7C]" /> Poznámka pre kuriéra (voliteľné)</span>
							<textarea 
								name="note"
								value={deliveryAddress.note}
								onChange={handleAddressChange}
								className="border border-gray-300 rounded-lg px-3 py-2 min-h-[88px] focus:outline-none focus:ring-2 focus:ring-[#EE4C7C]" 
								placeholder="Dvere č. 5, zvoniť na Novák"
							/>
						</label>
					</div>
				</div>
			)}
		</section>
	);
} 