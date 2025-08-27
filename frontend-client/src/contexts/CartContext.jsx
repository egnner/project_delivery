import { createContext, useContext, useReducer, useEffect } from 'react'

const CartContext = createContext()

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.id === action.payload.id)
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        }
      } else {
        return {
          ...state,
          items: [...state.items, action.payload]
        }
      }
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      }
    
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      }
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      }
    
    case 'SET_CUSTOMER_INFO':
      return {
        ...state,
        customerInfo: action.payload
      }
    
    case 'RESTORE_CART':
      return {
        ...state,
        items: action.payload.items || [],
        customerInfo: action.payload.customerInfo || null
      }
    
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    customerInfo: null
  })

  // Calcular total do carrinho
  const total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  
  // Calcular quantidade total de itens
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)

  // Salvar carrinho no localStorage
  useEffect(() => {
    localStorage.setItem('delivery-cart', JSON.stringify(state))
  }, [state])

  // Carregar carrinho do localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('delivery-cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        if (parsedCart.items) {
          dispatch({ type: 'RESTORE_CART', payload: parsedCart })
        }
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error)
      }
    }
  }, [])

  const addToCart = (product, quantity = 1) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        quantity
      }
    })
  }

  const removeFromCart = (productId) => {
    dispatch({
      type: 'REMOVE_ITEM',
      payload: productId
    })
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { id: productId, quantity }
      })
    }
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const setCustomerInfo = (customerInfo) => {
    dispatch({
      type: 'SET_CUSTOMER_INFO',
      payload: customerInfo
    })
  }

  const value = {
    items: state.items,
    customerInfo: state.customerInfo,
    total,
    itemCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setCustomerInfo
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider')
  }
  return context
}
