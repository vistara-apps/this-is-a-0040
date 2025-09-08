import React from 'react'
import { Button } from './ui/Button'
import { Sparkles, Zap, Target, TrendingUp } from 'lucide-react'

export function Hero({ onGetStarted }) {
  return (
    <section className="py-24 px-4 text-center bg-gradient-to-b from-surface to-background">
      <div className="container max-w-4xl">
        <div className="inline-flex items-center px-4 py-2 rounded-full border bg-surface/50 text-sm mb-8">
          <Sparkles className="h-4 w-4 mr-2 text-primary" />
          AI-Powered Business Asset Generation
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted bg-clip-text text-transparent">
          Generate stunning logos & compelling content for your business, in minutes.
        </h1>
        
        <p className="text-xl text-muted mb-12 max-w-2xl mx-auto leading-relaxed">
          DigiNinja Pro helps solo founders and entrepreneurs create professional business assets instantly. 
          From logos to ad copy, build your brand faster than ever.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button size="lg" onClick={onGetStarted} className="text-lg px-8">
            Start Creating Now
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8">
            Watch Demo
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
            <p className="text-muted">Generate professional assets in minutes, not weeks.</p>
          </div>
          <div className="text-center">
            <Target className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
            <p className="text-muted">Advanced AI creates content tailored to your brand.</p>
          </div>
          <div className="text-center">
            <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Revenue Ready</h3>
            <p className="text-muted">Build assets that convert visitors into customers.</p>
          </div>
        </div>
      </div>
    </section>
  )
}