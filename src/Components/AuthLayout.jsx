import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import PageContainer from "./PageContainer"

const AuthLayout = ({ children, title, subtitle, linkText, linkPath }) => {
  // Set the page title
  useEffect(() => {
    document.title = `${title} - SV Profiles`
    return () => {
      document.title = "SV Profiles"
    }
  }, [title])

  return (
    <PageContainer
      className="flex flex-col items-center justify-center"
      bgColor="bg-gradient-to-b from-gray-50 to-gray-100"
    >
      <div className="w-full max-w-md space-y-6 bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-100 my-8 sm:my-12">
        <div>
          <div className="flex justify-center">
            <Logo className="h-16 w-auto" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[#1c3860]">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-center text-sm text-gray-600">
              {subtitle}{" "}
              <Link
                to={linkPath}
                className="font-medium text-[#dbac56] hover:text-[#c99b49] transition-colors duration-200"
              >
                {linkText}
              </Link>
            </p>
          )}
        </div>
        {children}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} SV Profiles. All rights reserved.
          </p>
        </div>
      </div>
    </PageContainer>
  )
}

export default AuthLayout;
