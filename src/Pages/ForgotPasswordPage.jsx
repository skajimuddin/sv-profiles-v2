import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../Components/AuthLayout';
import { sendPasswordReset } from "../Firebase/auth"

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await sendPasswordReset(email)
      if (result.error) {
        setError(result.error)
        setIsLoading(false)
      } else {
        setIsLoading(false)
        setIsSubmitted(true)
        console.log("Password reset requested for:", email)
      }
    } catch (err) {
      setIsLoading(false)
      setError(err.message || "Failed to send reset email. Please try again.")
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Remember your password?"
      linkText="Sign in here"
      linkPath="/login"
    >
      {!isSubmitted ? (
        <div className="mt-8 space-y-6">
          <div>
            <p className="text-sm text-gray-600 text-center">
              Enter the email address associated with your account and we'll
              send you a link to reset your password.
            </p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 mb-3 text-sm bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email-address"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#dbac56] focus:border-[#dbac56] transition duration-150 ease-in-out sm:text-sm"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-[#1c3860] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#dbac56] transition duration-150 ease-in-out
                ${
                  isLoading
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-[#162d4d]"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg
                      className="h-5 w-5 text-[#dbac56] group-hover:text-[#c99b49]"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
                {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
              </button>
            </div>
          </form>

          <div className="text-center">
            <Link
              to="/signup"
              className="font-medium text-[#dbac56] hover:text-[#c99b49] text-sm transition duration-150 ease-in-out"
            >
              Don't have an account? Sign up
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="mb-4 rounded-full bg-green-100 p-3">
              <svg
                className="h-8 w-8 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Check your email
            </h3>
            <p className="mt-2 text-center text-sm text-gray-600">
              We've sent a password reset link to{" "}
              <span className="font-medium">{email}</span>
            </p>
          </div>

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-500">
              Didn't receive an email? Check your spam folder or
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="font-medium text-[#dbac56] hover:text-[#c99b49] text-sm"
            >
              Try with a different email address
            </button>
          </div>

          <div className="pt-4 text-center">
            <Link
              to="/login"
              className="inline-flex items-center font-medium text-[#1c3860] hover:text-[#2a5490] text-sm transition duration-150 ease-in-out"
            >
              <svg
                className="mr-1 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to login
            </Link>
          </div>
        </div>
      )}
    </AuthLayout>
  )
}

export default ForgotPasswordPage;
