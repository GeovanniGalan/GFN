// src/contexts/UserContext.js

// Import React hooks for context, state, and effects.
import React, { createContext, useState, useEffect, useContext } from 'react';
// Import 'onAuthStateChanged' from Firebase Auth to listen for user login/logout events.
import { onAuthStateChanged } from 'firebase/auth';
// Import our Firebase 'auth' instance.
import { auth } from '../firebase';
// Import the 'fetchUserProfile' function from our new firebaseService.
import { fetchUserProfile } from '../api/firebaseService';
// Import 'useNavigate' to programmatically redirect users.
import { useNavigate } from 'react-router-dom';

// Create a new React Context. This is where your user data will live.
const UserContext = createContext();

/**
 * UserProvider component. It wraps your entire application (or a part of it)
 * and makes the user data available to all child components.
 * It also manages the authentication state and fetches the user's profile.
 */
export const UserProvider = ({ children }) => {
  // 'user' state: Stores the authenticated user object (from Firebase Auth)
  // along with their profile data (like displayName) and a 'profileComplete' flag.
  const [user, setUser] = useState(null);
  
  // 'loadingUser' state: Indicates if the initial user authentication and profile
  // fetch is still in progress. Useful for displaying loading spinners.
  const [loadingUser, setLoadingUser] = useState(true);

  // useNavigate hook allows us to redirect users programmatically.
  const navigate = useNavigate();

  // useEffect hook to listen for changes in Firebase Authentication state.
  // This runs once when the component mounts and sets up a listener.
  useEffect(() => {
    // 'onAuthStateChanged' returns an unsubscribe function.
    // This listener fires whenever the user's sign-in status changes (login, logout).
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        // If a user is logged in (authUser is not null):
        // 1. Fetch their profile from Firestore using our service function.
        const profile = await fetchUserProfile(authUser.uid);
        
        if (profile) {
          // If a profile exists, set the user state with their display name and mark profile as complete.
          setUser({ ...authUser, displayName: profile.displayName, profileComplete: true });
        } else {
          // If no profile exists (first-time login or profile not set up yet):
          // Set user with a fallback display name (email) and mark profile as incomplete.
          setUser({ ...authUser, displayName: authUser.email, profileComplete: false });
          
          // IMPORTANT: If profile is incomplete, redirect to the profile setup page.
          // We check 'window.location.pathname' to prevent an infinite loop if the user is already on that page.
          if (window.location.pathname !== '/setup-profile') {
            navigate('/setup-profile');
          }
        }
      } else {
        // If no user is logged in (authUser is null), clear the user state.
        setUser(null);
      }
      // After checking auth state and fetching profile (if applicable), set loading to false.
      setLoadingUser(false);
    });

    // Cleanup function: This is called when the component unmounts.
    // It unsubscribes from the Firebase auth state listener to prevent memory leaks.
    return () => unsubscribe();
  }, [navigate]); // 'navigate' is a dependency because it's used inside the useEffect.

  // The UserContext.Provider makes the 'user', 'setUser', and 'loadingUser'
  // states available to all components wrapped by this provider.
  return (
    <UserContext.Provider value={{ user, setUser, loadingUser }}>
      {children} {/* Render all child components */}
    </UserContext.Provider>
  );
};

/**
 * Custom hook to easily consume the UserContext.
 * Any component can call 'const { user, loadingUser } = useUser();'
 * to access the global user state.
 */
export const useUser = () => useContext(UserContext);