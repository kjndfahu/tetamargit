"use client";

import { useState } from "react";
import { SuccessModal } from "@/features/cart/success-modal";

export function Competitions() {
	const [open, setOpen] = useState(false);

	return (
		<section id="competitions" className="flex flex-col items-center gap-8 px-4 sm:px-6 lg:px-20">
			<h2 className="text-3xl md:text-4xl font-bold mb-6 text-black">Súťaže</h2>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<div className="rounded-xl p-7 border-2 border-dashed border-orange-500 overflow-hidden aspect-video flex items-center justify-center">
					<video className="w-full h-full rounded-xl object-cover" controls poster="/window.svg">
						<source src="https://youtu.be/AUoR5_-R5XQ?si=DL88lD63zFXfvnSs" type="video/mp4" />
						Váš prehliadač nepodporuje prehrávanie videa.
					</video>
				</div>

				<div className="bg-white shadow rounded-xl p-6">
					<h3 className="text-lg font-semibold text-black mb-4">Prihláška do súťaže</h3>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							setOpen(true);
						}}
						className="grid grid-cols-1 sm:grid-cols-2 gap-4"
					>
						<label className="flex flex-col gap-1">
							<span className="text-sm text-gray-700">Meno</span>
							<input required className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Ján" />
						</label>
						<label className="flex flex-col gap-1">
							<span className="text-sm text-gray-700">Priezvisko</span>
							<input required className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Novák" />
						</label>
						<label className="flex flex-col gap-1 sm:col-span-2">
							<span className="text-sm text-gray-700">E‑mail</span>
							<input required type="email" className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="jan.novak@example.com" />
						</label>
						<label className="flex flex-col gap-1 sm:col-span-2">
							<span className="text-sm text-gray-700">Telefónne číslo</span>
							<input required type="tel" className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="+421 900 123 456" />
						</label>
						<label className="flex flex-col gap-1 sm:col-span-2">
							<span className="text-sm text-gray-700">Nahrať video</span>
							<input required type="file" accept="video/*" className="border border-gray-300 rounded-lg px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100" />
						</label>
						<div className="sm:col-span-2">
							<button type="submit" className="w-full cursor-pointer bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition">Odoslať</button>
						</div>
					</form>
				</div>
			</div>

			<SuccessModal
				open={open}
				onClose={() => setOpen(false)}
				title="Prihláška bola odoslaná"
				message="Ďakujeme! Váš video súbor sme prijali. Budeme vás kontaktovať."
				primaryHref="/"
				primaryText="Späť na hlavnú"
				secondaryText="Zavrieť"
			/>
		</section>
	);
} 