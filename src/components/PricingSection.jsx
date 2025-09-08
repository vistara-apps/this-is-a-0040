import React from 'react'
import { Button } from './ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { Check } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export function PricingSection() {
  const { user, updateSubscription } = useAuth()

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out DigiNinja Pro',
      features: [
        '3 AI generations per month',
        'Basic logo concepts',
        'Simple ad copy',
        'Community support'
      ],
      tier: 'free',
      popular: false
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'per month',
      description: 'For serious entrepreneurs building their brand',
      features: [
        'Unlimited AI generations',
        'Advanced logo variations',
        'Multi-platform ad copy',
        'Social media templates',
        'Content idea brainstorming',
        'Priority support'
      ],
      tier: 'pro',
      popular: true
    },
    {
      name: 'Premium',
      price: '$59',
      period: 'per month',
      description: 'Everything you need to scale your business',
      features: [
        'Everything in Pro',
        'Custom brand guidelines',
        'Advanced asset templates',
        'API access',
        'White-label options',
        'Dedicated account manager'
      ],
      tier: 'premium',
      popular: false
    }
  ]

  const handleUpgrade = (tier) => {
    // In a real app, this would integrate with Stripe
    updateSubscription(tier)
  }

  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Start free and scale as you grow. All plans include our core AI-powered features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.tier}
              className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted ml-1">/{plan.period}</span>
                </div>
                <p className="text-muted mt-2">{plan.description}</p>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handleUpgrade(plan.tier)}
                  disabled={user?.subscriptionTier === plan.tier}
                >
                  {user?.subscriptionTier === plan.tier 
                    ? 'Current Plan' 
                    : plan.tier === 'free' 
                      ? 'Get Started' 
                      : 'Upgrade Now'
                  }
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}