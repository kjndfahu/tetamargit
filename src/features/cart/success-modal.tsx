"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, X } from "lucide-react";

interface SuccessModalProps {
	open: boolean;
	onClose: () => void;
}

export function SuccessModal({ open, onClose }: SuccessModalProps) {
	useEffect(() => {
		if (!open) return;
		const t = setTimeout(() => {
			onClose();
		}, 2000);
		return () => clearTimeout(t);
	}, [open, onClose]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
			<div role="dialog" aria-modal="true" className="relative bg-white rounded-xl shadow-xl w-[92%] sm:w-[520px] p-6">
				<button aria-label="Zavrieť" onClick={onClose} className="absolute cursor-pointer top-3 right-3 p-2 rounded-full hover:bg-gray-100 text-gray-600">
					<X className="h-5 w-5" />
				</button>
				<div className="flex flex-col items-center text-center">
					<CheckCircle2 className="h-14 w-14 text-green-500" />
					<h4 className="mt-4 text-xl font-semibold text-black">Objednávka bola úspešne odoslaná</h4>
					<p className="mt-2 text-gray-600">Ďakujeme za nákup! Potvrdenie nájdete v e‑maile.</p>
					<div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
						<Link href="/" className="w-full text-center px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-black">Pokračovať v nákupe</Link>
						<button onClick={onClose} className="w-full cursor-pointer px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white">Zavrieť</button>
					</div>
				</div>
			</div>
		</div>
	);
} 