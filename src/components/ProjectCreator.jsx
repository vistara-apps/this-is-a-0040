import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Dialog'
import { Button } from './ui/Button'
import { Input } from './ui/Input'

export function ProjectCreator({ isOpen, onClose, onCreateProject }) {
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    description: '',
    brandColors: '',
    brandFonts: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onCreateProject(formData)
    setFormData({
      name: '',
      industry: '',
      description: '',
      brandColors: '',
      brandFonts: ''
    })
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'E-commerce', 'Education',
    'Real Estate', 'Food & Beverage', 'Fashion', 'Travel', 'Consulting',
    'Marketing', 'Legal', 'Fitness', 'Entertainment', 'Other'
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Business Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter your business name"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Industry *</label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
              value={formData.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
              required
            >
              <option value="">Select your industry</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief description of your business"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Brand Colors</label>
            <Input
              value={formData.brandColors}
              onChange={(e) => handleChange('brandColors', e.target.value)}
              placeholder="e.g., Blue, White, Gray"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Brand Fonts</label>
            <Input
              value={formData.brandFonts}
              onChange={(e) => handleChange('brandFonts', e.target.value)}
              placeholder="e.g., Modern, Sans-serif"
            />
          </div>

          <Button type="submit" className="w-full">
            Create Project
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}