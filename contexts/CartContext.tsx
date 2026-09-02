'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface CartItem {
  // Para productos normales
  variantId?: string
  productId?: string
  productSlug?: string
  variantSku?: string | null
  size?: string | null
  capacity?: string | null
  power?: string | null

  // Para combos
  comboId?: string
  comboSlug?: string

  // Común para ambos
  productName: string
  productBrand?: string | null
  price: number
  quantity: number
  image: string | null
  maxStock: number
  isCombo?: boolean
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Cargar carrito desde localStorage al montar
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error al cargar carrito:', error)
      }
    }
  }, [])

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const getItemId = (item: CartItem) => {
    return item.comboId || item.variantId || ''
  }

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const itemId = item.comboId || item.variantId
      const existing = prev.find((i) => getItemId(i) === itemId)

      if (existing) {
        // Incrementar cantidad si no excede el stock
        if (existing.quantity < existing.maxStock) {
          return prev.map((i) =>
            getItemId(i) === itemId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        }
        return prev
      }

      // Agregar nuevo item con cantidad 1
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => getItemId(i) !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }

    setItems((prev) =>
      prev.map((i) => {
        if (getItemId(i) === itemId) {
          // No permitir exceder el stock
          const newQuantity = Math.min(quantity, i.maxStock)
          return { ...i, quantity: newQuantity }
        }
        return i
      })
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
    throw new Error('useCart debe usarse dentro de CartProvider')
  }
  return context
}
