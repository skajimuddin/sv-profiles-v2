import { StrictMode, useState, useEffect } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.jsx"
import Preloader from "./Preloader"

// Main App wrapper with preloader functionality
const AppWithPreloader = () => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading process or wait for resources
    window.addEventListener("load", () => {
      // Add a slightly longer delay to show the animation
      setTimeout(() => {
        setLoading(false)
      }, 2500)
    })

    // If window already loaded, hide preloader
    if (document.readyState === "complete") {
      setTimeout(() => {
        setLoading(false)
      }, 2500)
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
