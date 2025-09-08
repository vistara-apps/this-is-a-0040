import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Dialog'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { useProjects } from '../hooks/useProjects'
import { useAuth } from '../hooks/useAuth.jsx'
import { generateLogoPrompts, generateAdCopy, generateContentIdeas } from '../lib/openai'
import { Loader2 } from 'lucide-react'

export function AssetGenerator({ isOpen, onClose, project, type }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [formData, setFormData] = useState({})
  const { addAsset } = useProjects()
  const { incrementGenerations } = useAuth()

  const getFormFields = () => {
    switch (type) {
      case 'logo':
        return [
          { key: 'style', label: 'Style Preference', placeholder: 'e.g., Modern, Minimalist, Bold' },
          { key: 'colors', label: 'Color Preferences', placeholder: 'e.g., Blue, Gray, White' }
        ]
      case 'ad-copy':
        return [
          { key: 'product', label: 'Product/Service', placeholder: 'What are you advertising?' },
          { key: 'audience', label: 'Target Audience', placeholder: 'Who is your ideal customer?' },
          { key: 'platform', label: 'Platform', placeholder: 'Facebook, Google, Instagram, etc.' }
        ]
      case 'content-ideas':
        return [
          { key: 'audience', label: 'Target Audience', placeholder: 'Who is your audience?' },
          { key: 'goals', label: 'Content Goals', placeholder: 'Education, Entertainment, Sales, etc.' }
        ]
      case 'social-post':
        return [
          { key: 'platform', label: 'Platform', placeholder: 'Instagram, Twitter, LinkedIn, etc.' },
          { key: 'topic', label: 'Topic/Theme', placeholder: 'What should the post be about?' },
          { key: 'tone', label: 'Tone', placeholder: 'Professional, Casual, Funny, etc.' }
        ]
      default:
        return []
    }
  }

  const handleGenerate = async () => {
    if (!project) return

    setLoading(true)
    try {
      let content = ''
      
      switch (type) {
        case 'logo':
          content = await generateLogoPrompts(
            project.name,
            project.industry,
            formData.style || 'modern'
          )
          break
        case 'ad-copy':
          content = await generateAdCopy(
            formData.product || project.name,
            formData.audience || 'business owners',
            formData.platform || 'Facebook'
          )
          break
        case 'content-ideas':
          content = await generateContentIdeas(
            project.industry,
            formData.audience || 'potential customers'
          )
          break
        case 'social-post':
          content = `Social Media Post for ${formData.platform || 'Instagram'}

Topic: ${formData.topic || 'Business update'}
Tone: ${formData.tone || 'Professional'}

Here's your engaging social media post:

🌟 Ready to transform your ${project.industry.toLowerCase()} business? 

At ${project.name}, we believe in [your core value proposition]. Our clients consistently see [specific benefit] because we focus on [unique approach].

💡 Pro tip: [Insert valuable insight related to your industry]

What's your biggest challenge in ${project.industry.toLowerCase()}? Drop a comment below! 👇

#${project.industry} #BusinessGrowth #${project.name.replace(/\s+/g, '')}`
          break
      }
      
      setResult(content)
      
      // Add asset to project
      addAsset(project.id, {
        type,
        content,
        projectId: project.id
      })
      
      // Increment generation count
      incrementGenerations()
      
    } catch (error) {
      console.error('Generation error:', error)
      setResult('Sorry, there was an error generating your content. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    onClose()
    setResult('')
    setFormData({})
  }

  const formFields = getFormFields()

  const getTitle = () => {
    switch (type) {
      case 'logo': return 'Generate Logo Concepts'
      case 'ad-copy': return 'Generate Ad Copy'
      case 'content-ideas': return 'Generate Content Ideas'
      case 'social-post': return 'Create Social Media Post'
      default: return 'Generate Asset'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!result && (
            <>
              {formFields.map((field) => (
                <div key={field.key}>
                  <label className="text-sm font-medium">{field.label}</label>
                  <Input
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                  />
                </div>
              ))}

              <Button 
                onClick={handleGenerate} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate'
                )}
              </Button>
            </>
          )}

          {result && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-2">Generated Content:</h4>
                <div className="whitespace-pre-wrap text-sm">{result}</div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1">
                  Save to Project
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setResult('')}
                  className="flex-1"
                >
                  Generate Another
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
