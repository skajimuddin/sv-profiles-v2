import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../Context/AuthContextProvider"
import { useOrders } from "../Context/OrdersContextProvider"
import Logo from "./Logo"
import { logout } from "../Firebase/auth"

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { currentUser, userDetails, loading } = useAuth()
  const { cart } = useOrders()
  const cartItemCount =
    cart?.reduce((total, item) => total + item.quantity, 0) || 0
  const location = useLocation()
  const navigate = useNavigate()

  // Close mobile menu on navigation
  useEffect(() => {
    setIsMenuOpen(false)
    setIsProfileOpen(false)
  }, [location.pathname])

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout()
      navigate("/login")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  // Check if route is active
  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    )
  }

  // User navigation items
  const userNavigationItems = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Orders", href: "/orders" },
  ]

  // Admin navigation (only shown to admins)
  const adminNavigationItems = [
    { name: "Admin Dashboard", href: "/admin" },
    { name: "Manage Products", href: "/admin/products" },
    { name: "Manage Orders", href: "/admin/orders" },
  ]

  // User profile dropdown items
  const userMenuItems = [
    { name: "Your Profile", onClick: () => navigate("/profile") },
    { name: "Sign out", onClick: handleLogout },
  ]

  // If there's no authenticated user, return null
  if (!currentUser && !loading) {
    return null
  }

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Logo />
            </div>

            {/* Desktop menu */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {userNavigationItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`${
                    isActive(item.href)
                      ? "border-[var(--secondary-color)] text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-16`}
                >
                  {item.name}
                </Link>
              ))}

              {/* Show admin links only to users with admin role */}
              {userDetails?.roles?.includes("admin") &&
                adminNavigationItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`${
                      isActive(item.href)
                        ? "border-[var(--primary-color)] text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-16`}
                  >
                    {item.name}
                  </Link>
                ))}
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {/* Cart icon with items badge */}
            <Link
              to="/cart"
              className="p-2 rounded-full text-gray-500 hover:text-gray-600 relative"
            >
              <span className="sr-only">View cart</span>{" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-[var(--primary-color)] rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Profile dropdown */}
            <div className="ml-3 relative">
              <div>
                <button
                  type="button"
                  className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--secondary-color)]"
                  id="user-menu-button"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-[var(--secondary-color)] flex items-center justify-center text-white font-medium">
                    {currentUser?.email?.charAt(0).toUpperCase() || "U"}
                  </div>
                </button>
              </div>

              {/* Profile dropdown menu */}
              {isProfileOpen && (
                <div
                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                >
                  <div className="px-4 py-2 text-xs text-gray-500">
                    Signed in as
                  </div>
                  <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b border-gray-100">
                    {currentUser?.email}
                  </div>

                  {userMenuItems.map((item, index) => (
                    <a
                      key={index}
                      onClick={item.onClick}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                      role="menuitem"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--secondary-color)]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {userNavigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`${
                  isActive(item.href)
                    ? "bg-[var(--secondary-color-light)] border-[var(--secondary-color)] text-[var(--secondary-color)]"
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              >
                {item.name}
              </Link>
            ))}
            {/* Show admin links only to users with admin role */}
            {userDetails?.roles?.includes("admin") &&
              adminNavigationItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`${
                    isActive(item.href)
                      ? "bg-[var(--primary-color-light)] border-[var(--primary-color)] text-[var(--primary-color)]"
                      : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                >
                  {item.name}
                </Link>
              ))}
            {/* Mobile cart link */}{" "}
            <Link
              to="/cart"
              className={`${
                isActive("/cart")
                  ? "bg-[var(--secondary-color-light)] border-[var(--secondary-color)] text-[var(--secondary-color)]"
                  : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              } flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium relative`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              Cart
              {cartItemCount > 0 && (
                <span className="absolute top-2 left-6 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-[var(--primary-color)] rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile profile section */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-[var(--secondary-color)] flex items-center justify-center text-white font-medium">
                  {currentUser?.email?.charAt(0).toUpperCase() || "U"}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">
                  {userDetails?.displayName || "User"}
                </div>
                <div className="text-sm font-medium text-gray-500 truncate max-w-[200px]">
                  {currentUser?.email}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              {userMenuItems.map((item, index) => (
                <a
                  key={index}
                  onClick={item.onClick}
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 cursor-pointer"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
