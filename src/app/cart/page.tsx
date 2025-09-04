"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DeliverySection, type DeliveryMethod } from "@/features/cart/delivery-section";
import { PaymentSection, type PaymentMethod } from "@/features/cart/payment-section";
import { ProductsSection } from "@/features/cart/product-section";
import { SummarySidebar } from "@/features/cart/summary-sidebar";
import { SuccessModal } from "@/features/cart/success-modal";

export default function CartPage() {
	const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("pickup");
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
	const [isSuccessOpen, setIsSuccessOpen] = useState(false);
	const router = useRouter();

	useEffect(() => {
		if (!isSuccessOpen) return;
		const t = setTimeout(() => {
			setIsSuccessOpen(false);
			router.push("/");
		}, 2000);
		return () => clearTimeout(t);
	}, [isSuccessOpen, router]);

	return (
		<main className=" px-4 sm:px-6 lg:px-20 py-10 w-full">
			<h1 className="text-3xl font-bold mb-8 text-black">Košík</h1>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2 space-y-6">
					<DeliverySection deliveryMethod={deliveryMethod} setDeliveryMethod={setDeliveryMethod} />
					<PaymentSection paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
					<ProductsSection />
				</div>

				<SummarySidebar
					deliveryMethod={deliveryMethod}
					paymentMethod={paymentMethod}
					onCheckout={() => setIsSuccessOpen(true)}
				/>
			</div>

			<SuccessModal open={isSuccessOpen} onClose={() => setIsSuccessOpen(false)} />
		</main>
	);
} 