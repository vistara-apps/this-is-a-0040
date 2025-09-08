import React, { useState } from 'react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Dashboard } from './components/Dashboard'
import { PricingSection } from './components/PricingSection'
import { AuthModal } from './components/AuthModal'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import { Sparkles, Image, FileText, MessageSquare, Lightbulb } from 'lucide-react'

function AppContent() {
  const { user, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState('login')

  const handleLogin = () => {
    setAuthMode('login')
    setShowAuthModal(true)
  }

  const handleSignup = () => {
    setAuthMode('signup')
    setShowAuthModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p>Loading DigiNinja Pro...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return (
      <>
        <Header onLogin={handleLogin} onSignup={handleSignup} />
        <Dashboard />
      </>
    )
  }

  return (
    <>
      <Header onLogin={handleLogin} onSignup={handleSignup} />
      <Hero onGetStarted={handleSignup} />
      
      {/* Features Section */}
      <section id="features" className="py-24 bg-surface">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Build Your Brand</h2>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              Our AI-powered tools help you create professional business assets in minutes, not weeks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <Image className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI Logo Generator</h3>
              <p className="text-muted">
                Create stunning, professional logos that perfectly represent your brand identity.
              </p>
            </div>
            
            <div className="text-center">
              <FileText className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Ad Copy That Converts</h3>
              <p className="text-muted">
                Generate high-converting ad copy for all major platforms to maximize your ROI.
              </p>
            </div>
            
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Social Media Templates</h3>
              <p className="text-muted">
                Professional templates for Instagram, Twitter, LinkedIn and more social platforms.
              </p>
            </div>
            
            <div className="text-center">
              <Lightbulb className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Content Ideas</h3>
              <p className="text-muted">
                Never run out of content ideas with our AI-powered brainstorming tool.
              </p>
            </div>
          </div>
        </div>
      </section>

      <PricingSection />

      {/* CTA Section */}
      <section className="py-24 bg-primary text-white">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Business?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of entrepreneurs who are already using DigiNinja Pro to build their brands faster.
          </p>
          <button 
            onClick={handleSignup}
            className="bg-white text-primary px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            Start Creating Now - It's Free
          </button>
        </div>
      </section>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
