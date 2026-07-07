import { useState, useEffect } from 'react'

const useGreeting = (name) => {
  const [greeting, setGreeting] = useState({ text: '', icon: '👋', theme: 'default' })

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours()
      let text, icon, theme, bg

      if (hour >= 5 && hour < 12) {
        text = `Good Morning${name ? `, ${name}` : ''}`;
        icon = '🌅'; theme = 'morning'
        bg = 'linear-gradient(135deg, #f97316 0%, #f59e0b 50%, #fbbf24 100%)'
      } else if (hour >= 12 && hour < 17) {
        text = `Good Afternoon${name ? `, ${name}` : ''}`;
        icon = '☀️'; theme = 'afternoon'
        bg = 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #6366f1 100%)'
      } else if (hour >= 17 && hour < 21) {
        text = `Good Evening${name ? `, ${name}` : ''}`;
        icon = '🌆'; theme = 'evening'
        bg = 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #ec4899 100%)'
      } else {
        text = `Good Night${name ? `, ${name}` : ''}`;
        icon = '🌙'; theme = 'night'
        bg = 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)'
      }
      setGreeting({ text, icon, theme, bg })
    }

    updateGreeting()
    const interval = setInterval(updateGreeting, 60000)
    return () => clearInterval(interval)
  }, [name])

  return greeting
}

export default useGreeting