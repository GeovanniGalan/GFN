// src/components/auth/Auth.js

import React, { useState } from 'react';
// Import Firebase authentication functions.
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
// Import 'auth' from our Firebase setup.
import { auth } from '../../firebase';
// Import 'useNavigate' to redirect after successful authentication.
import { useNavigate } from 'react-router-dom';
// Import 'useUser' to potentially update the user context directly if needed,
// though onAuthStateChanged in UserContext will handle it.
import { useUser } from '../../contexts/UserContext';


/**
 * Auth component for user login and signup.
 */
const Auth = () => {
  // State variables for email and password input fields.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // State to manage loading during auth operations.
  const [loading, setLoading] = useState(false);
  // State to display any authentication errors.
  const [error, setError] = useState(null);

  // Hook to programmatically navigate.
  const navigate = useNavigate();
  // Access the user context (though onAuthStateChanged handles the main update).
  const { setUser } = useUser();

  /**
   * Handles user signup with email and password.
   * @param {Event} e - The form submission event.
   */
  const handleSignup = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior (page reload).
    setLoading(true);   // Set loading state to true.
    setError(null);     // Clear any previous errors.

    try {
      // Firebase function to create a new user.
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User signed up:', userCredential.user);
      
      // Update the user state in the context (though onAuthStateChanged in UserProvider also does this).
      // Marking profileComplete as false here, as new users need to set up their display name.
      setUser({ ...userCredential.user, displayName: userCredential.user.email, profileComplete: false });

      // After successful signup, redirect to the profile setup page.
      navigate('/setup-profile');

    } catch (err) {
      // Catch and display any errors during signup.
      console.error('Error signing up:', err.message);
      setError(err.message); // Display the error message to the user.
    } finally {
      setLoading(false); // Reset loading state.
    }
  };

  /**
   * Handles user login with email and password.
   * @param {Event} e - The form submission event.
   */
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission.
    setLoading(true);   // Set loading state to true.
    setError(null);     // Clear any previous errors.

    try {
      // Firebase function to sign in an existing user.
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in:', userCredential.user);
      
      // onAuthStateChanged in UserProvider will fetch profile and update context,
      // so no explicit setUser call needed here immediately after login.
      // Redirect to the dashboard after successful login. PrivateRoute will handle
      // redirecting to /setup-profile if the profile is incomplete.
      navigate('/dashboard'); 

    } catch (err) {
      // Catch and display any errors during login.
      console.error('Error logging in:', err.message);
      setError(err.message); // Display the error message to the user.
    } finally {
      setLoading(false); // Reset loading state.
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      <h2>Login or Sign Up</h2>
      <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@example.com"
            required
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            disabled={loading} // Disable inputs when loading
          />
        </div>
        <div>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            required
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            disabled={loading} // Disable inputs when loading
          />
        </div>
        {/* Display error messages if any */}
        {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            type="submit"
            onClick={handleLogin}
            disabled={loading} // Disable button when loading
            style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1 }}
          >
            {loading ? 'Logging In...' : 'Login'}
          </button>
          <button
            type="submit"
            onClick={handleSignup}
            disabled={loading} // Disable button when loading
            style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1 }}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Auth;