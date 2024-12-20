import { db } from '../firebase'; // Ensure firebase.js is set up correctly
import {
  collection,
  addDoc,
  getDoc,
  setDoc,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

export async function createLobby(lobbyName, hostName) {
  try {
    const lobbyRef = await addDoc(collection(db, 'lobbies'), {
      name: lobbyName,
      host: hostName,
      players: [],
      createdAt: new Date(),
    });
    return lobbyRef.id;
  } catch (error) {
    console.error('Error creating lobby:', error);
    throw error;
  }
}

export async function joinLobby(lobbyId, playerName) {
  try {
    const lobbyDocRef = doc(db, 'lobbies', lobbyId);
    const lobbySnapshot = await getDoc(lobbyDocRef);

    if (lobbySnapshot.exists()) {
      const lobbyData = lobbySnapshot.data();
      await updateDoc(lobbyDocRef, {
        players: [...lobbyData.players, playerName],
      });
    } else {
      throw new Error('Lobby not found');
    }
  } catch (error) {
    console.error('Error joining lobby:', error);
    throw error;
  }
}

export async function fetchLobbies() {
  try {
    const lobbiesQuery = query(collection(db, 'lobbies'));
    const lobbiesSnapshot = await getDocs(lobbiesQuery);

    return lobbiesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching lobbies:', error);
    throw error;
  }
}
