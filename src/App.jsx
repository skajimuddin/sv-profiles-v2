import { BrowserRouter, Route, Routes } from "react-router-dom"
import HomePage from "./Pages/HomePage"
import LoginPage from "./Pages/LoginPage"
import SignupPage from "./Pages/SignupPage"
import ForgotPasswordPage from "./Pages/ForgotPasswordPage"
import { lazy, Suspense } from "react"

// Create a Not Found Page component
const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-[#1c3860]">
            404
          </h2>
          <p className="mt-2 text-center text-lg text-gray-600">
            Page not found
          </p>
          <p className="mt-2 text-center text-sm text-gray-500">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div>
          <a
            href="/"
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#1c3860] hover:bg-[#162d4d]"
          >
            Go back home
          </a>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
