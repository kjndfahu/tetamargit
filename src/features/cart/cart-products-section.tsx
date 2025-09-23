"use client";

import { Package, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";

export function CartProductsSection() {
	const { cartItems, updateCartItem, removeCartItem } = useCart();
	const [updatingItems, setUpdatingItems] = useState<string[]>([]);

	const handleQuantityChange = async (itemId: string, newQuantity: number) => {
		if (updatingItems.includes(itemId)) return;
		
		try {
			setUpdatingItems(prev => [...prev, itemId]);
			await updateCartItem(itemId, newQuantity);
		} catch (error) {
			console.error('Error updating quantity:', error);
		} finally {
			setUpdatingItems(prev => prev.filter(id => id !== itemId));
		}
	};

	const handleRemoveItem = async (itemId: string) => {
		if (updatingItems.includes(itemId)) return;
		
		try {
			setUpdatingItems(prev => [...prev, itemId]);
			await removeCartItem(itemId);
		} catch (error) {
			console.error('Error removing item:', error);
		} finally {
			setUpdatingItems(prev => prev.filter(id => id !== itemId));
		}
	};

	return (
		<section className="bg-white shadow rounded-xl p-6">
			<h2 className="text-xl font-semibold mb-4 text-black flex items-center gap-2">
				<Package className="h-5 w-5 text-[#EE4C7C]" /> 
				Produkty ({cartItems.length})
			</h2>
			
			{cartItems.length === 0 ? (
				<p className="text-gray-500 text-center py-8">Žiadne produkty v košíku</p>
			) : (
				<div className="divide-y divide-gray-200">
					{cartItems.map((item) => (
						<div key={item.id} className="py-4">
							<div className="flex items-start gap-4">
								{/* Product Image */}
								<div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
									{item.product?.image_url ? (
										<img
											src={item.product.image_url}
											alt={item.product.name}
											className="w-full h-full object-cover"
										/>
									) : (
										<div className="w-full h-full bg-gray-200 flex items-center justify-center">
											<Package className="w-6 h-6 text-gray-400" />
										</div>
									)}
								</div>

								{/* Product Details */}
								<div className="flex-1 min-w-0">
									<h3 className="text-black font-medium mb-1">
										{item.product?.name || 'Neznámy produkt'}
									</h3>
									<p className="text-gray-600 text-sm mb-2 line-clamp-2">
										{item.product?.description || 'Bez popisu'}
									</p>
									<div className="flex items-center gap-2 text-sm text-gray-500">
										<span>{item.product?.weight} {item.product?.unit}</span>
										{item.product?.category && (
											<>
												<span>•</span>
												<span>{item.product.category.name}</span>
											</>
										)}
									</div>
								</div>

								{/* Quantity Controls */}
								<div className="flex items-center gap-2">
									<button
										onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
										disabled={updatingItems.includes(item.id) || item.quantity <= 1}
										className="p-1 rounded-full border border-gray-300 hover:border-[#EE4C7C] hover:text-[#EE4C7C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
									>
										<Minus className="w-4 h-4" />
									</button>
									
									<span className="w-8 text-center font-medium text-black">
										{item.quantity}
									</span>
									
									<button
										onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
										disabled={updatingItems.includes(item.id)}
										className="p-1 rounded-full border border-gray-300 hover:border-[#EE4C7C] hover:text-[#EE4C7C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
									>
										<Plus className="w-4 h-4" />
									</button>
								</div>

								{/* Price and Remove */}
								<div className="text-right">
									<div className="text-black font-semibold mb-2">
										{(item.price * item.quantity).toFixed(2)}€
									</div>
									<button
										onClick={() => handleRemoveItem(item.id)}
										disabled={updatingItems.includes(item.id)}
										className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
										title="Odstrániť z košíka"
									>
										<Trash2 className="w-4 h-4" />
									</button>
								</div>
							</div>

							{updatingItems.includes(item.id) && (
								<div className="mt-2 text-center">
									<span className="text-sm text-gray-500">Aktualizujem...</span>
								</div>
							)}
						</div>
					))}
				</div>
			)}
		</section>
	);
}