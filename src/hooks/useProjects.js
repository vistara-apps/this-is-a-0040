import { useState, useEffect } from 'react'
import { generateId } from '../lib/utils'

export function useProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load projects from localStorage
    const savedProjects = localStorage.getItem('digininja_projects')
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects))
    }
    setLoading(false)
  }, [])

  const saveProjects = (newProjects) => {
    setProjects(newProjects)
    localStorage.setItem('digininja_projects', JSON.stringify(newProjects))
  }

  const createProject = (projectData) => {
    const newProject = {
      id: generateId(),
      ...projectData,
      createdAt: new Date().toISOString(),
      assets: []
    }
    
    const updatedProjects = [...projects, newProject]
    saveProjects(updatedProjects)
    return newProject
  }

  const updateProject = (projectId, updates) => {
    const updatedProjects = projects.map(project =>
      project.id === projectId ? { ...project, ...updates } : project
    )
    saveProjects(updatedProjects)
  }

  const deleteProject = (projectId) => {
    const updatedProjects = projects.filter(project => project.id !== projectId)
    saveProjects(updatedProjects)
  }

  const addAsset = (projectId, asset) => {
    const newAsset = {
      id: generateId(),
      ...asset,
      createdAt: new Date().toISOString()
    }

    const updatedProjects = projects.map(project =>
      project.id === projectId
        ? { ...project, assets: [...(project.assets || []), newAsset] }
        : project
    )
    saveProjects(updatedProjects)
    return newAsset
  }

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    addAsset
  }
}