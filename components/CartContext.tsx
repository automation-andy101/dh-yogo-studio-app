'use client'
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  category: string
  options?: Record<string, string>
  emoji?: string
}

interface CartState {
  items: CartItem[]
  drinkTiming?: 'before_class' | 'after_class' | 'now'
  classTime?: string
  customerName?: string
  customerEmail?: string
}

type CartAction =
  | { type: 'ADD_ITEM'; item: CartItem }
  | { type: 'REMOVE_ITEM'; id: string; options?: Record<string, string> }
  | { type: 'UPDATE_QTY'; id: string; quantity: number; options?: Record<string, string> }
  | { type: 'SET_DRINK_TIMING'; timing: 'before_class' | 'after_class' | 'now' }
  | { type: 'SET_CLASS_TIME'; time: string }
  | { type: 'SET_CUSTOMER'; name: string; email: string }
  | { type: 'CLEAR' }

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const key = action.item.id + JSON.stringify(action.item.options || {})
      const existing = state.items.find(
        (i) => i.id + JSON.stringify(i.options || {}) === key
      )
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id + JSON.stringify(i.options || {}) === key
              ? { ...i, quantity: i.quantity + action.item.quantity }
              : i
          ),
        }
      }
      return { ...state, items: [...state.items, action.item] }
    }
    case 'REMOVE_ITEM': {
      const key = action.id + JSON.stringify(action.options || {})
      return { ...state, items: state.items.filter((i) => i.id + JSON.stringify(i.options || {}) !== key) }
    }
    case 'UPDATE_QTY': {
      const key = action.id + JSON.stringify(action.options || {})
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.id + JSON.stringify(i.options || {}) !== key) }
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.id + JSON.stringify(i.options || {}) === key ? { ...i, quantity: action.quantity } : i
        ),
      }
    }
    case 'SET_DRINK_TIMING':
      return { ...state, drinkTiming: action.timing }
    case 'SET_CLASS_TIME':
      return { ...state, classTime: action.time }
    case 'SET_CUSTOMER':
      return { ...state, customerName: action.name, customerEmail: action.email }
    case 'CLEAR':
      return { items: [] }
    default:
      return state
  }
}

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
  total: number
  itemCount: number
} | null>(null)

const STORAGE_KEY = 'deansgate-haus-cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] }, () => {
    // Load from localStorage on first render
    if (typeof window === 'undefined') return { items: [] }
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : { items: [] }
    } catch {
      return { items: [] }
    }
  })

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ state, dispatch, total, itemCount }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) {
    return {
      state: { items: [] as CartItem[] },
      dispatch: () => {},
      total: 0,
      itemCount: 0,
    }
  }
  return ctx
}