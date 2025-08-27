import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { CartProvider } from './contexts/CartContext'
import { StoreSettingsProvider } from './contexts/StoreSettingsContext'
import Header from './components/Header'
import Footer from './components/Footer'
import PageTitle from './components/PageTitle'
import Home from './pages/Home'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderStatus from './pages/OrderStatus'
import OrderHistory from './pages/OrderHistory'
import About from './pages/About'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simular carregamento inicial
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <StoreSettingsProvider>
      <CartProvider>
        <PageTitle />
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order/:id" element={<OrderStatus />} />
              <Route path="/order-history" element={<OrderHistory />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </StoreSettingsProvider>
  )
}

export default App
