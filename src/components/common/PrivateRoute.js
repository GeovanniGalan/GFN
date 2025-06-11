// src/components/common/PrivateRoute.js

import React from 'react';
// Import 'useNavigate' for programmatic navigation.
import { useNavigate } from 'react-router-dom';
// Import our custom 'useUser' hook to access global user state.
import { useUser } from '../../contexts/UserContext';
// Import our LoadingSpinner component.
import LoadingSpinner from './LoadingSpinner';

/**
 * PrivateRoute component.
 * It's a wrapper for <Route> elements that should only be accessible
 * by authenticated and (optionally) profile-complete users.
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - The child components (the actual route content) to render if authenticated.
 */
function PrivateRoute({ children }) {
  // Use our custom hook to get the user object and loading status from the context.
  const { user, loadingUser } = useUser();
  // Initialize the navigate function.
  const navigate = useNavigate();

  // Step 1: Handle initial loading state.
  // While the user's authentication status and profile are being fetched,
  // display a loading spinner to prevent flickering or unauthorized content.
  if (loadingUser) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  // Step 2: If no user is authenticated, redirect to the authentication page.
  // This is the primary security check for private routes.
  if (!user) {
    navigate('/auth'); // Redirect to login/signup page.
    return null; // Don't render any children content.
  }

  // Step 3: If user is authenticated but their profile is not complete, redirect to setup.
  // This ensures new users are guided to complete their essential profile details (like display name).
  // We add a check for 'window.location.pathname' to prevent an infinite redirect loop
  // if the user is already on the /setup-profile page.
  if (user && !user.profileComplete && window.location.pathname !== '/setup-profile') {
    navigate('/setup-profile');
    return null; // Don't render children content for this route.
  }

  // Step 4: If authenticated and profile is complete (or user is already on /setup-profile),
  // render the child components (the actual content of the protected route).
  return children;
}

export default PrivateRoute;