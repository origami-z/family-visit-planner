import { useEffect } from 'react'

import { FamilyPlannerProvider } from '@/context/FamilyPlannerContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { AppRouter } from '@/router'

import './styles.css'

export default function App() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const dataParam = urlParams.get('data')
    if (dataParam) {
      try {
        const decoded = JSON.parse(decodeURI(dataParam))
        localStorage.setItem('family-planner-data', JSON.stringify(decoded))
        window.location.href = import.meta.env.BASE_URL
      } catch (error) {
        console.error('Error loading shared data:', error)
      }
    }
  }, [])

  return (
    <ThemeProvider>
      <FamilyPlannerProvider>
        <AppRouter />
      </FamilyPlannerProvider>
    </ThemeProvider>
  )
}
