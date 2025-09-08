import React from 'react'
import { Button } from './ui/Button'
import { useAuth } from '../hooks/useAuth.jsx'
import { Sparkles, LogOut, User } from 'lucide-react'

export function Header({ onLogin, onSignup }) {
  const { user, logout } = useAuth()

  return (
    <header className="border-b bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">DigiNinja Pro</span>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
            Features
          </a>
          <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
            Pricing
          </a>
          <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">
            About
          </a>
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="text-sm">{user.email}</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {user.subscriptionTier}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" onClick={onLogin}>
                Login
              </Button>
              <Button onClick={onSignup}>
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
