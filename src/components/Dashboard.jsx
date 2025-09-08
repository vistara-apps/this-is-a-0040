import React, { useState } from 'react'
import { Button } from './ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/Dialog'
import { Input } from './ui/Input'
import { useProjects } from '../hooks/useProjects'
import { useAuth } from '../hooks/useAuth'
import { Plus, Image, FileText, MessageSquare, Lightbulb, MoreVertical } from 'lucide-react'
import { ProjectCreator } from './ProjectCreator'
import { AssetGenerator } from './AssetGenerator'
import { formatDate } from '../lib/utils'

export function Dashboard() {
  const { projects, createProject } = useProjects()
  const { user } = useAuth()
  const [selectedProject, setSelectedProject] = useState(null)
  const [showCreator, setShowCreator] = useState(false)
  const [showGenerator, setShowGenerator] = useState(false)
  const [generatorType, setGeneratorType] = useState('')

  const handleCreateProject = (projectData) => {
    const project = createProject(projectData)
    setSelectedProject(project)
    setShowCreator(false)
  }

  const handleGenerateAsset = (type) => {
    setGeneratorType(type)
    setShowGenerator(true)
  }

  const generationStats = {
    used: user?.generationsUsed || 0,
    limit: user?.generationsLimit || 3,
    remaining: (user?.generationsLimit || 3) - (user?.generationsUsed || 0)
  }

  const assetTypes = [
    {
      id: 'logo',
      name: 'AI Logo Generator',
      description: 'Create professional logos for your brand',
      icon: Image,
      color: 'text-blue-500'
    },
    {
      id: 'ad-copy',
      name: 'Ad Copy Generator',
      description: 'Write compelling ad copy that converts',
      icon: FileText,
      color: 'text-green-500'
    },
    {
      id: 'social-post',
      name: 'Social Media Posts',
      description: 'Create engaging social media content',
      icon: MessageSquare,
      color: 'text-purple-500'
    },
    {
      id: 'content-ideas',
      name: 'Content Brainstormer',
      description: 'Get fresh content ideas for your business',
      icon: Lightbulb,
      color: 'text-yellow-500'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted mt-1">Create amazing business assets with AI</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-muted">Generations:</span>
              <span className="font-medium ml-1">
                {generationStats.used} / {generationStats.limit === Infinity ? '∞' : generationStats.limit}
              </span>
            </div>
            
            {!selectedProject && (
              <Button onClick={() => setShowCreator(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            )}
          </div>
        </div>

        {selectedProject ? (
          <div>
            {/* Project Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedProject(null)}
                  className="mb-2"
                >
                  ← Back to Projects
                </Button>
                <h2 className="text-2xl font-bold">{selectedProject.name}</h2>
                <p className="text-muted">{selectedProject.industry} • Created {formatDate(selectedProject.createdAt)}</p>
              </div>
            </div>

            {/* Asset Generation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {assetTypes.map((type) => (
                <Card key={type.id} className="cursor-pointer hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <type.icon className={`h-8 w-8 ${type.color}`} />
                    </div>
                    <h3 className="font-semibold mb-2">{type.name}</h3>
                    <p className="text-sm text-muted mb-4">{type.description}</p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleGenerateAsset(type.id)}
                      disabled={generationStats.remaining <= 0 && user?.subscriptionTier === 'free'}
                    >
                      Generate
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Generated Assets */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Generated Assets</h3>
              {selectedProject.assets && selectedProject.assets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedProject.assets.map((asset) => (
                    <Card key={asset.id}>
                      <CardHeader>
                        <CardTitle className="text-sm capitalize">{asset.type.replace('-', ' ')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm whitespace-pre-wrap">{asset.content}</div>
                        <div className="text-xs text-muted mt-2">
                          {formatDate(asset.createdAt)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="text-muted">No assets generated yet. Start creating!</div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <div>
            {/* Projects Grid */}
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <Card 
                    key={project.id} 
                    className="cursor-pointer hover:shadow-md transition-all"
                    onClick={() => setSelectedProject(project)}
                  >
                    <CardHeader>
                      <CardTitle>{project.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted mb-2">{project.industry}</p>
                      <p className="text-sm text-muted">
                        {project.assets?.length || 0} assets • {formatDate(project.createdAt)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                  <p className="text-muted mb-4">Create your first project to start generating amazing business assets</p>
                  <Button onClick={() => setShowCreator(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Project
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      <ProjectCreator
        isOpen={showCreator}
        onClose={() => setShowCreator(false)}
        onCreateProject={handleCreateProject}
      />

      <AssetGenerator
        isOpen={showGenerator}
        onClose={() => setShowGenerator(false)}
        project={selectedProject}
        type={generatorType}
      />
    </div>
  )
}