import { StrictMode, useState, useEffect } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.jsx"
import Preloader from "./Preloader"

// Import Firebase debugging tools in development mode only
if (import.meta.env.DEV) {
  import('./Firebase/firestoreDebugger.js')
    .then(() => console.log('Firebase debugging tools loaded. Use window.FirebaseDebugTools in console.'))
    .catch(err => console.error('Failed to load debugging tools:', err));
}

// Main App wrapper with preloader functionality
const AppWithPreloader = () => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading process or wait for resources
    window.addEventListener("load", () => {
      // Add a small delay to ensure smooth transition
      setTimeout(() => {
        setLoading(false)
      }, 1000)
    })

    // If window already loaded, hide preloader
    if (document.readyState === "complete") {
      setTimeout(() => {
        setLoading(false)
      }, 1000)
    }

    return () => {
      window.removeEventListener("load", () => {
        setLoading(false)
      })
    }
  }, [])

  return (
    <>
      {loading && <Preloader />}
      <App />
    </>
  )
}

createRoot(document.getElementById("page")).render(
  <StrictMode>
    <AppWithPreloader />
  </StrictMode>
)
