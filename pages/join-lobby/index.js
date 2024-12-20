import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../lib/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

const JoinLobbyScreen = () => {
  const router = useRouter();
  const [lobbyCode, setLobbyCode] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const joinLobby = async () => {
    if (!lobbyCode || !username) {
      setError('Please enter a valid lobby code and username.');
      return;
    }

    const lobbyRef = doc(db, 'lobbies', lobbyCode);

    try {
      console.log(`[DEBUG] Attempting to join lobby with code: ${lobbyCode}`);
      
      // Check if the lobby exists in Firestore
      const lobbySnap = await getDoc(lobbyRef);

      if (!lobbySnap.exists()) {
        // If the lobby doesn't exist, create it and set the user as the host
        console.log(`[DEBUG] Lobby "${lobbyCode}" not found. Creating a new lobby.`);
        await setDoc(lobbyRef, {
          players: {
            [username]: {
              username,
              isHost: true, // Mark the first user as the host
              score: 0, // Initialize score
            },
          },
          bingoList: [],
          gameStarted: false,
        });

        console.log(`[DEBUG] Lobby "${lobbyCode}" created with user "${username}" as host.`);
      } else {
        // Extract lobby data and validate structure
        const lobbyData = lobbySnap.data();
        console.log(`[DEBUG] Lobby data found:`, lobbyData);

        if (!lobbyData.players) {
          setError('Lobby is not properly set up.');
          return;
        }

        // Add the current player to the lobby
        await updateDoc(lobbyRef, {
          [`players.${username}`]: {
            username,
            isHost: false, // Mark additional players as non-host
            score: 0, // Initialize score
          },
        });

        console.log(`[DEBUG] User "${username}" added to lobby "${lobbyCode}".`);
      }

      // Save the username locally for reuse
      localStorage.setItem('userName', username);

      // Navigate to the lobby screen
      router.push(`/lobby/${lobbyCode}`);
    } catch (err) {
      console.error('Error joining or creating lobby:', err);
      setError('Failed to join or create the lobby. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <h1>Join a Lobby</h1>
      {error && <p style={styles.error}>{error}</p>}
      <input
        type="text"
        placeholder="Enter Lobby Code"
        value={lobbyCode}
        onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
        style={styles.input}
      />
      <input
        type="text"
        placeholder="Enter Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={styles.input}
      />
      <button onClick={joinLobby} style={styles.button}>
        Join Lobby
      </button>
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    padding: '20px',
  },
  input: {
    display: 'block',
    margin: '10px auto',
    padding: '10px',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '5px',
    width: '80%',
    maxWidth: '400px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '1rem',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
  },
};

export default JoinLobbyScreen;
