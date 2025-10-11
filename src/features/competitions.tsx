"use client";

import { useState, useEffect } from "react";
import { SuccessModal } from "@/features/cart/success-modal";
import { supabase } from '@/config/supabase';
import { validators, useFormInputHandler } from '@/lib/validators';

export function Competitions() {
	const [open, setOpen] = useState(false);
	const [videoUrl, setVideoUrl] = useState<string>("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { handleInputChange } = useFormInputHandler();
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		phone: ''
	});

	useEffect(() => {
		const { data } = supabase.storage
			.from('Competition')
			.getPublicUrl('TetaMargit.mp4');
		
		setVideoUrl(data.publicUrl);
	}, []);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError(null);

		try {
			const formDataFromForm = new FormData(e.currentTarget);
			const firstName = formData.firstName;
			const lastName = formData.lastName;
			const email = formData.email;
			const phone = formData.phone;
			const videoFile = formDataFromForm.get('video') as File;

			// Validation
			if (!validators.email(email)) {
				throw new Error('Zadajte platný email.');
			}
			
			if (!validators.phone(phone, false)) { // Phone is required
				throw new Error('Zadajte platné telefónne číslo.');
			}

			if (!videoFile) {
				throw new Error('Prosím vyberte video súbor');
			}

			// Create unique filename
			const fileExt = videoFile.name.split('.').pop();
			const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
			const filePath = `${email}/${fileName}`;

			// Upload video to Supabase Storage
			const { data: uploadData, error: uploadError } = await supabase.storage
				.from('Competitors')
				.upload(filePath, videoFile);

			if (uploadError) {
				throw uploadError;
			}

			// Get the public URL of the uploaded video
			const { data: urlData } = supabase.storage
				.from('Competitors')
				.getPublicUrl(filePath);

			// Save form data to database
			const { error: dbError } = await supabase
				.from('competitors')
				.insert({
					first_name: firstName,
					last_name: lastName,
					email: email,
					phone: phone,
					video_path: filePath,
					video_url: urlData.publicUrl
				});

			if (dbError) {
				throw dbError;
			}

			// Reset form and show success modal
			setFormData({
				firstName: '',
				lastName: '',
				email: '',
				phone: ''
			});
			(e.target as HTMLFormElement).reset();
			setOpen(true);

		} catch (error) {
			console.error('Error submitting form:', error);
			setError(error instanceof Error ? error.message : 'Chyba pri odosielaní formulára. Skúste to znovu.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<section id="competitions" className="flex flex-col items-center gap-8 px-4 sm:px-6 lg:px-20">
			<h2 className="text-3xl md:text-4xl font-bold mb-6 text-black">Súťaže</h2>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<div className="rounded-xl p-7 border-2 border-dashed border-[#8B4513] overflow-hidden aspect-video flex items-center justify-center">
					<video 
						className="w-full h-full rounded-xl object-cover" 
						controls
						key={videoUrl}
						preload="metadata"
					>
						<source src={videoUrl} type="video/mp4" />
						Váš prehliadač nepodporuje prehrávanie videa.
					</video>
				</div>

				<div className="bg-white shadow rounded-xl p-6">
					<h3 className="text-lg font-semibold text-black mb-4">Prihláška do súťaže</h3>
					
					{error && (
						<div className="mb-4 rounded-lg bg-red-50 text-red-700 border border-red-200 px-4 py-3 text-sm">
							{error}
						</div>
					)}

					<form
						onSubmit={handleSubmit}
						className="grid grid-cols-1 sm:grid-cols-2 gap-4"
					>
						<label className="flex flex-col gap-1">
							<span className="text-sm text-gray-700">Meno</span>
							<input 
								name="firstName"
								value={formData.firstName}
								onChange={(e) => handleInputChange(e, setFormData)}
								required 
								className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8B4513]" 
								placeholder="Ján" 
							/>
						</label>
						<label className="flex flex-col gap-1">
							<span className="text-sm text-gray-700">Priezvisko</span>
							<input 
								name="lastName"
								value={formData.lastName}
								onChange={(e) => handleInputChange(e, setFormData)}
								required 
								className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8B4513]" 
								placeholder="Novák" 
							/>
						</label>
						<label className="flex flex-col gap-1 sm:col-span-2">
							<span className="text-sm text-gray-700">E‑mail</span>
							<input 
								name="email"
								value={formData.email}
								onChange={(e) => handleInputChange(e, setFormData)}
								required 
								type="email" 
								className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8B4513]" 
								placeholder="jan.novak@example.com" 
							/>
						</label>
						<label className="flex flex-col gap-1 sm:col-span-2">
							<span className="text-sm text-gray-700">Telefónne číslo</span>
							<input 
								name="phone"
								value={formData.phone}
								onChange={(e) => handleInputChange(e, setFormData)}
								required 
								type="tel" 
								className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8B4513]" 
								placeholder="+421 900 123 456" 
							/>
						</label>
						<label className="flex flex-col gap-1 sm:col-span-2">
							<span className="text-sm text-gray-700">Nahrať video</span>
							<input 
								name="video"
								required 
								type="file" 
								accept="video/*" 
								className="border border-gray-300 rounded-lg px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[#A0826D]/20 file:text-[#2C1810] hover:file:bg-[#A0826D]/30" 
							/>
						</label>
						<div className="sm:col-span-2">
							<button 
								type="submit" 
								disabled={isSubmitting}
								className="w-full cursor-pointer bg-[#8B4513] hover:bg-[#2C1810] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition"
							>
								{isSubmitting ? 'Odosielam...' : 'Odoslať'}
							</button>
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
