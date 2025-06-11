// src/components/profile/UserProfileSetup.js

import React, { useState, useEffect } from 'react';
// Import 'useNavigate' for redirection.
import { useNavigate } from 'react-router-dom';
// Import our custom 'useUser' hook to access and update the global user state.
import { useUser } from '../../contexts/UserContext';
// Import 'setUserProfile' from our firebaseService to save the profile data.
import { setUserProfile } from '../../api/firebaseService';

/**
 * UserProfileSetup component.
 * Guides authenticated users to set up their initial public profile (e.g., displayName).
 */
const UserProfileSetup = () => {
  // Get the current user object and a function to update it from the context.
  const { user, setUser } = useUser();
  // Hook to programmatically navigate.
  const navigate = useNavigate();

  // State for the displayName input field.
  const [displayName, setDisplayName] = useState('');
  // State for loading indicator during profile saving.
  const [loading, setLoading] = useState(false);
  // State for displaying error messages.
  const [error, setError] = useState(null);

  // useEffect to populate displayName if it already exists in user context.
  // This is useful if a user comes back to this page but already has a display name set.
  useEffect(() => {
    if (user && user.displayName && user.profileComplete) {
      setDisplayName(user.displayName);
    }
  }, [user]); // Depends on 'user' object from context.

  /**
   * Handles the submission of the profile setup form.
   * @param {Event} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission.

    // Basic validation: ensure user is logged in and displayName is not empty.
    if (!user || !displayName.trim()) {
      setError("Please provide a valid display name.");
      return;
    }

    setLoading(true); // Set loading state.
    setError(null);   // Clear previous errors.

    try {
      // Call our service function to save the profile data to Firestore.
      await setUserProfile(user.uid, {
        displayName: displayName.trim(),
        lowercaseDisplayName: displayName.trim().toLowerCase(), // Store lowercase for search
        email: user.email, // Store email for convenience, though auth() has it
        createdAt: new Date(),
        // Add any other initial profile fields here
      });

      // Update the user object in the global context to reflect the new displayName
      // and mark profile as complete. This will trigger a re-render and remove
      // the need for redirection if the user is now complete.
      setUser(prevUser => ({
        ...prevUser,
        displayName: displayName.trim(),
        profileComplete: true // Set to true after successful setup
      }));

      // Redirect to the dashboard after successful profile setup.
      navigate('/dashboard');

    } catch (err) {
      console.error("Error setting up profile:", err);
      setError("Failed to save profile. Please try again.");
    } finally {
      setLoading(false); // Reset loading state.
    }
  };

  // If user is not available (e.g., not logged in), display a message.
  // PrivateRoute should typically prevent reaching here, but it's a good safeguard.
  if (!user) {
    return <p style={{ textAlign: 'center', marginTop: '50px' }}>Please log in to set up your profile.</p>;
  }

  // If the user's profile is already marked as complete in the context,
  // it means they've already set it up. Redirect them away from this page.
  // This prevents complete users from unnecessarily interacting with this setup form.
  if (user.profileComplete) {
    navigate('/dashboard');
    return null; // Don't render the form if profile is complete.
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      <h2>Complete Your Profile</h2>
      <p>Please choose a display name for your public profile on GFN.</p>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="displayName" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Display Name:</label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g., FlourishFan"
            required
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            disabled={loading} // Disable input while loading
          />
        </div>
        {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
        <button
          type="submit"
          style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          disabled={loading} // Disable button while loading
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

export default UserProfileSetup;