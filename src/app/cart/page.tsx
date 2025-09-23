"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/features/auth/auth-modal";
import { DeliverySection, type DeliveryMethod } from "@/features/cart/delivery-section";
import { PaymentSection, type PaymentMethod } from "@/features/cart/payment-section";
import { CartProductsSection } from "@/features/cart/cart-products-section";
import { SummarySidebar } from "@/features/cart/summary-sidebar";
import { SuccessModal } from "@/features/cart/success-modal";

export default function CartPage() {
	const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("pickup");
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
	const [isSuccessOpen, setIsSuccessOpen] = useState(false);
	const [showAuthModal, setShowAuthModal] = useState(false);
	const hasCheckedAuth = useRef(false);
	const { cartSummary, loading, error, clearCart } = useCart();
	const { isAuthenticated, loading: authLoading } = useAuth();
	const router = useRouter();

	// Check authentication when component mounts
	useEffect(() => {
		if (!authLoading && !hasCheckedAuth.current) {
			hasCheckedAuth.current = true;
			if (!isAuthenticated) {
				setShowAuthModal(true);
			}
		}
	}, [isAuthenticated, authLoading]);

	useEffect(() => {
		if (!isSuccessOpen) return;
		const t = setTimeout(() => {
			setIsSuccessOpen(false);
			router.push("/");
		}, 2000);
		return () => clearTimeout(t);
	}, [isSuccessOpen, router]);

	const handleCheckout = async () => {
		try {
			// Here you would normally process the order
			// For now, we'll just clear the cart and show success
			await clearCart();
			setIsSuccessOpen(true);
		} catch (error) {
			console.error('Checkout error:', error);
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
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EE4C7C] mx-auto"></div>
					<p className="mt-4 text-gray-600">Načítavam košík...</p>
				</div>
			) : cartSummary.itemCount === 0 ? (
				<div className="text-center py-12">
					<p className="text-gray-600 text-lg mb-4">Váš košík je prázdny</p>
					<Link href="/" className="bg-[#EE4C7C] hover:bg-[#9A1750] text-white font-semibold py-3 px-6 rounded-lg transition-colors">
						Pokračovať v nákupe
					</Link>
				</div>
			) : (
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2 space-y-6">
					<DeliverySection deliveryMethod={deliveryMethod} setDeliveryMethod={setDeliveryMethod} />
					<PaymentSection paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
					<CartProductsSection />
				</div>

				<SummarySidebar
					cartSummary={cartSummary}
					deliveryMethod={deliveryMethod}
					paymentMethod={paymentMethod}
					onCheckout={handleCheckout}
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