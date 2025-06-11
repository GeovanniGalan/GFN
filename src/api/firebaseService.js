// src/api/firebaseService.js

// Import necessary Firestore functions for database operations.
import { collection, query, where, getDocs, limit, orderBy, onSnapshot, doc, getDoc, setDoc } from 'firebase/firestore';
// Import 'signOut' from Firebase Auth for logging users out.
import { signOut } from 'firebase/auth';
// Import 'db' and 'auth' from our centralized Firebase configuration file.
import { db, auth } from '../firebase';

// --- User Profile Operations ---

/**
 * Fetches a user's profile data from Firestore.
 * @param {string} uid - The unique ID of the user.
 * @returns {Promise<Object|null>} A promise that resolves to the user's profile object
 * (including its ID) or null if not found.
 */
export const fetchUserProfile = async (uid) => {
  // If no UID is provided, there's no profile to fetch.
  if (!uid) return null;
  
  // Create a reference to the specific user's document in the 'userProfiles' collection.
  // The path is 'userProfiles/{uid}'.
  const profileRef = doc(db, 'userProfiles', uid);
  
  // Fetch the document snapshot.
  const profileSnap = await getDoc(profileRef);
  
  // Check if the document exists.
  if (profileSnap.exists()) {
    // If it exists, return the document's data along with its ID.
    return { id: profileSnap.id, ...profileSnap.data() };
  }
  // If it doesn't exist, return null.
  return null;
};

/**
 * Creates or updates a user's profile in Firestore.
 * This is used for initial profile setup (e.g., setting displayName).
 * @param {string} uid - The unique ID of the user.
 * @param {Object} profileData - The data to set/update for the user's profile.
 * @returns {Promise<void>} A promise that resolves when the profile is set.
 */
export const setUserProfile = async (uid, profileData) => {
  if (!uid || !profileData) {
    throw new Error("UID and profile data are required to set a user profile.");
  }
  const userProfileRef = doc(db, 'userProfiles', uid);
  // 'setDoc' with '{ merge: true }' will create the document if it doesn't exist,
  // or merge the new data with existing data if it does, without overwriting.
  await setDoc(userProfileRef, profileData, { merge: true });
};


// --- Search Operations ---

/**
 * Searches for user profiles in Firestore based on a display name query.
 * It uses 'lowercaseDisplayName' field for case-insensitive prefix searching.
 * @param {string} queryText - The text to search for.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of matching user profiles.
 */
export const searchUserProfiles = async (queryText) => {
  // If the query text is empty or just spaces, return an empty array.
  if (!queryText || queryText.trim() === '') return [];
  
  // Convert the query text to lowercase for case-insensitive searching.
  const lowercasedQuery = queryText.toLowerCase();

  // Create a Firestore query:
  // 1. Target the 'userProfiles' collection.
  // 2. Filter documents where 'lowercaseDisplayName' starts with the query text.
  //    'where('lowercaseDisplayName', '>=', lowercasedQuery)' matches documents
  //    where the display name is greater than or equal to the query (alphabetically).
  //    'where('lowercaseDisplayName', '<=', lowercasedQuery + '\uf8ff')' matches
  //    documents where the display name is less than or equal to the query plus
  //    '\uf8ff' (a very high Unicode point, effectively matching all strings
  //    that start with the query).
  // 3. Limit the results to 5 for performance and relevance in a dropdown.
  const q = query(
    collection(db, 'userProfiles'),
    where('lowercaseDisplayName', '>=', lowercasedQuery),
    where('lowercaseDisplayName', '<=', lowercasedQuery + '\uf8ff'),
    limit(5)
  );

  // Execute the query.
  const querySnapshot = await getDocs(q);
  
  // Process the results: create an array of objects, including document ID and data.
  const results = [];
  querySnapshot.forEach((d) => {
    results.push({ id: d.id, ...d.data() });
  });
  return results;
};


// --- Auth Operations ---

/**
 * Logs out the currently authenticated user.
 * @returns {Promise<void>} A promise that resolves when the user is logged out.
 */
export const logoutUser = async () => {
  // Call the Firebase Auth signOut function.
  await signOut(auth);
};


// --- Chat Operations ---

/**
 * Subscribes to real-time updates for chats involving a specific user.
 * This sets up a real-time listener.
 * @param {string} uid - The user's ID to filter chats by.
 * @param {Function} onChatsUpdate - Callback function called with new chat data.
 * @param {Function} onError - Callback function called if an error occurs.
 * @returns {Function} An unsubscribe function to stop the real-time listener.
 */
export const subscribeToUserChats = (uid, onChatsUpdate, onError) => {
  // If no UID, don't set up a listener and return an empty array for initial state.
  if (!uid) {
    onChatsUpdate([]);
    return () => {}; // Return a no-op function for consistency.
  }

  // Create a Firestore query to find chats where the user's UID is in the 'participants' array.
  const chatsQuery = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', uid)
  );

  // Set up the real-time listener using 'onSnapshot'.
  // It returns an unsubscribe function that can be called to stop listening.
  return onSnapshot(chatsQuery, (snapshot) => { // Use snapshot.docs for actual data
    const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    onChatsUpdate(chats);
  }, onError);
};

/**
 * Fetches the count of messages in a chat, optionally filtering for unread messages.
 * This is a one-time fetch, not a real-time listener.
 * @param {string} chatId - The ID of the chat.
 * @param {Date|null} lastReadTimestamp - Optional timestamp to count messages created after this time.
 * @returns {Promise<number>} A promise that resolves to the number of messages.
 */
export const fetchChatMessagesCount = async (chatId, lastReadTimestamp = null) => {
  // Get a reference to the 'messages' subcollection within the specific chat document.
  const messagesCollectionRef = collection(db, 'chats', chatId, 'messages');
  let messagesQuery;

  // If a 'lastReadTimestamp' is provided, query for messages created *after* that time.
  if (lastReadTimestamp) {
    messagesQuery = query(
      messagesCollectionRef,
      orderBy('createdAt', 'asc'), // Order by creation time to use the 'where' clause efficiently.
      where('createdAt', '>', lastReadTimestamp)
    );
  } else {
    // If no timestamp, get all messages in the chat.
    messagesQuery = query(messagesCollectionRef);
  }

  // Execute the query and return the number of documents (messages).
  const messagesSnapshot = await getDocs(messagesQuery);
  return messagesSnapshot.size;
};

// You can add more functions here as your application grows,
// e.g., createPost, updatePost, sendMessage, getPost, etc.