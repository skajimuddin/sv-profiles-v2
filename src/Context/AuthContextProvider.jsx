import { createContext, useContext, useState, useEffect } from "react";
import { db } from "../Firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { checkAuthStatus } from "../Firebase/auth";
import { createFallbackUserData } from "../Firebase/firestoreErrorHandler";

const AuthContext = createContext({
  currentUser: null,
  userDetails: null,
  userLoggedIn: false,
  loading: true,
  updateUserType: () => {},
})

export function useAuth(){
  return useContext(AuthContext)
}

async function getUserDataById(userId) {
  try {
    const userDocRef = doc(db, "users", userId)
    const userDocSnap = await getDoc(userDocRef)
    
    if (userDocSnap.exists()) {
      return userDocSnap.data()
    }
    
    // If user document doesn't exist, return a basic user object
    console.warn(`No Firestore document found for user ${userId}. Using fallback data.`)
    return createFallbackUserData(userId)
  } catch (error) {
    console.error(`Error fetching user data for UID: ${userId}:`, error)
    
    // Create a more informative error message in the console
    if (error.code === 'permission-denied') {
      console.warn(
        `%cFirestore Permission Error: Please update security rules for user ${userId}`,
        'color: #ff5722; font-weight: bold'
      )
      console.info(
        '%cHint: Check firebase-security-rules.txt in your project and update rules in Firebase console',
        'color: #2196f3'
      )
    }
    
    // Return a fallback user object even when there's an error
    return createFallbackUserData(userId)
  }
}

export function AuthContextProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userDetails, setUserDetails] = useState(null)
  const [userLoggedIn, setUserLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  const updateUserType = (userType) => {
    if (userDetails && currentUser) {
      setUserDetails({
        ...userDetails,
        userType: userType,
      })
    }
  }
  useEffect(() => {
    const unsubscribe = checkAuthStatus(async (user) => {
      try {
        if (user) {
          // Fetch user details
          const fetchedUserDetails = await getUserDataById(user.uid)

          // Check if user is deactivated
          if (fetchedUserDetails && fetchedUserDetails.status === "deactive") {
            // If user is deactivated, sign them out
            import("../Firebase/auth").then(({ logout }) => {              logout().then(() => {
                setCurrentUser(null)
                setUserDetails(null)
                setUserLoggedIn(false)
                // Show toast or alert that account is deactivated
                alert(
                  "Your account has been deactivated. Please contact support."
                )
              })
            })          } else {            // User is active, proceed as normal
            setCurrentUser(user)
            setUserLoggedIn(true)
            setUserDetails(fetchedUserDetails)
            
            // Check if the data is a fallback (meaning there was an error or no data)
            if (fetchedUserDetails._isFallback === true) {
              console.warn(
                "%cUsing fallback user data due to Firestore access issues. Some features may be limited.",
                "background: #ff9800; color: white; padding: 2px 5px; border-radius: 3px;"
              )
              
              // Show onetime warning to the user
              setTimeout(() => {
                const warningShown = sessionStorage.getItem('firestoreWarningShown')
                if (!warningShown) {
                  alert(
                    "Note: There seems to be an issue accessing your user data in our database. " +
                    "You can continue using the app, but some features may be limited. " +
                    "Please contact support if this issue persists."
                  )
                  sessionStorage.setItem('firestoreWarningShown', 'true')
                }
              }, 1500)
            }
          }} else {
          setCurrentUser(null)
          setUserDetails(null)
          setUserLoggedIn(false)
        }
      } catch (error) {
        console.error("Error in auth status check:", error)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()  }, []) // Empty dependency array since this runs once on mount
  const value = {
    currentUser,
    userDetails,
    userLoggedIn,
    loading,
    updateUserType,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}