// D:\FYP\Chameleon Frontend\hooks\useSuppressBrowserExtensions.ts
"use client"

import { useEffect } from 'react'

export function useSuppressBrowserExtensions() {
  useEffect(() => {
    // Function to clean up browser extension attributes
    const cleanupBrowserExtensionAttributes = () => {
      // Remove Bis extension attributes
      const bisSelectors = [
        '[bis_skin_checked]',
        '[bis_register]',
        '[__processed_*]'
      ]
      
      bisSelectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector)
          elements.forEach(element => {
            // Remove attributes that match the pattern
            Array.from(element.attributes).forEach(attr => {
              if (attr.name.startsWith('bis_') || attr.name.startsWith('__processed_')) {
                element.removeAttribute(attr.name)
              }
            })
          })
        } catch (e) {
          // Silently fail
        }
      })
    }

    // Run cleanup after a short delay to ensure DOM is ready
    setTimeout(cleanupBrowserExtensionAttributes, 100)
    
    // Also run cleanup on DOM mutations
    const observer = new MutationObserver(cleanupBrowserExtensionAttributes)
    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['bis_skin_checked', 'bis_register']
    })

    return () => observer.disconnect()
  }, [])
}