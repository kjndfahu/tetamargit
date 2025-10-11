"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/features/auth/auth-modal";
import { DeliverySection, type DeliveryMethod, type DeliveryAddress } from "@/features/cart/delivery-section";
import { PaymentSection, type PaymentMethod } from "@/features/cart/payment-section";
import { CartProductsSection } from "@/features/cart/cart-products-section";
import { SummarySidebar } from "@/features/cart/summary-sidebar";
import { SuccessModal } from "@/features/cart/success-modal";
import { OrderService } from "@/lib/order";
import { validators } from '@/lib/shared/validators';

export default function CartPage() {
	const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("pickup");
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
	const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
		fullName: '',
		phone: '',
		email: '',
		street: '',
		city: '',
		postalCode: '',
		note: ''
	});
	const [errors, setErrors] = useState<{ [key: string]: string }>({});
	const [isSuccessOpen, setIsSuccessOpen] = useState(false);
	const [showAuthModal, setShowAuthModal] = useState(false);
	const [shouldRedirectHomeAfterAuth, setShouldRedirectHomeAfterAuth] = useState(false);
	const [isProcessingOrder, setIsProcessingOrder] = useState(false);
	const hasCheckedAuth = useRef(false);
	const wasAuthenticated = useRef<boolean | undefined>(undefined);
	const { cartSummary, loading, error, clearCart, refetch } = useCart();
	const { isAuthenticated, loading: authLoading, user } = useAuth();
	const router = useRouter();

	// Force cart refresh when products change
	const handleCartChange = () => {
		refetch();
	};

	// Set user email when authenticated and pickup method
	useEffect(() => {
		if (isAuthenticated && user?.email && deliveryMethod === "pickup") {
			setDeliveryAddress(prev => ({
				...prev,
				email: user.email || ''
			}));
		}
	}, [isAuthenticated, user?.email, deliveryMethod]);

	// Check authentication when component mounts
	useEffect(() => {
		if (!authLoading && !hasCheckedAuth.current) {
			hasCheckedAuth.current = true;
			if (!isAuthenticated) {
				setShowAuthModal(true);
				setShouldRedirectHomeAfterAuth(true);
			}
		}
	}, [isAuthenticated, authLoading]);

	// If user logged in while on /cart after being unauthenticated, redirect them home
	useEffect(() => {
		if (shouldRedirectHomeAfterAuth && isAuthenticated) {
			router.replace("/");
		}
	}, [shouldRedirectHomeAfterAuth, isAuthenticated, router]);

	// If user logs out while on cart, redirect to home
	useEffect(() => {
		if (authLoading) return;
		if (wasAuthenticated.current === undefined) {
			wasAuthenticated.current = isAuthenticated;
			return;
		}
		// Detect transition from logged-in -> logged-out
		if (wasAuthenticated.current && !isAuthenticated) {
			router.replace("/");
		}
		wasAuthenticated.current = isAuthenticated;
	}, [isAuthenticated, authLoading, router]);

	useEffect(() => {
		if (!isSuccessOpen) return;
		const t = window.setTimeout(() => {
			setIsSuccessOpen(false);
			router.push("/");
		}, 2000);
		return () => window.clearTimeout(t);
	}, [isSuccessOpen, router]);

	const validateForm = (): boolean => {
		const newErrors: { [key: string]: string } = {};

		if (deliveryMethod === "courier") {
			if (!deliveryAddress.fullName.trim()) {
				newErrors.fullName = "Meno a priezvisko je povinné";
			}
			if (!deliveryAddress.phone.trim()) {
				newErrors.phone = "Telefón je povinný";
			} else if (!validators.phone(deliveryAddress.phone, false)) {
				newErrors.phone = "Zadajte platné telefónne číslo";
			}
			if (!deliveryAddress.email.trim()) {
				newErrors.email = "Email je povinný";
			} else if (!validators.email(deliveryAddress.email)) {
				newErrors.email = "Zadajte platný email";
			}
			if (!deliveryAddress.street.trim()) {
				newErrors.street = "Ulica a číslo je povinné";
			}
			if (!deliveryAddress.city.trim()) {
				newErrors.city = "Mesto je povinné";
			}
			if (!deliveryAddress.postalCode.trim()) {
				newErrors.postalCode = "PSČ je povinné";
			}
		} else {
			// For pickup, we still need email for confirmation
			if (!deliveryAddress.email.trim() && user?.email) {
				setDeliveryAddress(prev => ({ ...prev, email: user.email || '' }));
			} else if (!deliveryAddress.email.trim() && !user?.email) {
				newErrors.email = "Email je potrebný pre potvrdenie objednávky";
			} else if (deliveryAddress.email.trim() && !validators.email(deliveryAddress.email)) {
				newErrors.email = "Zadajte platný email";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleCheckout = async () => {
		if (!validateForm()) {
			return;
		}

		try {
			setIsProcessingOrder(true);
			
			// Send order emails
			await OrderService.sendOrderEmails({
				cartSummary,
				deliveryMethod,
				paymentMethod,
				deliveryAddress: deliveryMethod === "courier" ? deliveryAddress : { 
					...deliveryAddress, 
					email: deliveryAddress.email || user?.email || '' 
				},
				userEmail: user?.email || deliveryAddress.email
			});

			// Clear the cart after successful order
			await clearCart();
			
			// Show success message
			setIsSuccessOpen(true);
		} catch (error) {
			console.error('Order processing error:', error);
			// You could show an error message here
		} finally {
			setIsProcessingOrder(false);
		}
	};

	const handleAuthSuccess = () => {
		setShowAuthModal(false);
	};

	return (
		<main className=" px-4 sm:px-6 lg:px-20 py-10 w-full">
			<h1 className="text-3xl font-bold mb-8 text-black">Košík</h1>

			{error && (
				<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
					<p className="text-red-600">{error}</p>
				</div>
			)}

			{loading || authLoading ? (
				<div className="text-center py-12">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto"></div>
					<p className="mt-4 text-gray-600">Načítavam košík...</p>
				</div>
			) : cartSummary.itemCount === 0 ? (
				<div className="text-center py-12">
					<p className="text-gray-600 text-lg mb-4">Váš košík je prázdny</p>
					<Link href="/" className="bg-[#8B4513] hover:bg-[#2C1810] text-white font-semibold py-3 px-6 rounded-lg transition-colors">
						Pokračovať v nákupe
					</Link>
				</div>
			) : (
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2 space-y-6">
					<DeliverySection 
						deliveryMethod={deliveryMethod} 
						setDeliveryMethod={setDeliveryMethod}
						deliveryAddress={deliveryAddress}
						setDeliveryAddress={setDeliveryAddress}
						errors={errors}
					/>
					<PaymentSection paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
					<CartProductsSection onCartChange={handleCartChange} />
				</div>

				<SummarySidebar
					cartSummary={cartSummary}
					deliveryMethod={deliveryMethod}
					paymentMethod={paymentMethod}
					onCheckout={handleCheckout}
					isProcessing={isProcessingOrder}
				/>
			</div>
			)}

			<SuccessModal open={isSuccessOpen} onClose={() => setIsSuccessOpen(false)} />
			
			<AuthModal 
				open={showAuthModal && !isAuthenticated} 
				onClose={() => router.push('/')} 
				type="login" 
			/>
		</main>
	);
}