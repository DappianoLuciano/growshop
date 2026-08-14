'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type CartItem = {
  variantId: string
  productId: string
  productName: string
  productSlug: string
  size?: string
  capacity?: string
  power?: string
  price: number
  quantity: number
  imageUrl?: string
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'growshop-cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Cargar carrito del localStorage al montar
  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (stored) {
      try {
        setItems(JSON.parse(stored))
      } catch (e) {
        console.error('Error loading cart:', e)
      }
    }
    setIsHydrated(true)
  }, [])

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    }
  }, [items, isHydrated])

  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.variantId === newItem.variantId
      )

      if (existingIndex > -1) {
        // Ya existe, incrementar cantidad
        const updated = [...prevItems]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        }
        return updated
      } else {
        // Nuevo item
        return [...prevItems, { ...newItem, quantity: 1 }]
      }
    })
  }

  const removeItem = (variantId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.variantId !== variantId))
  }

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId)
      return
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.variantId === variantId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
