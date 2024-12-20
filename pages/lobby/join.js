import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

const JoinLobbyScreen = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);

  // Function to generate a random 4-letter code
  const generateLobbyCode = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return Array(4)
      .fill(null)
      .map(() => letters.charAt(Math.floor(Math.random() * letters.length)))
      .join('');
  };

  const joinLobby = async () => {
    if (!username.trim()) {
      setError('Username cannot be empty');
      return;
    }

    try {
      const lobbyCode = generateLobbyCode();
      const lobbyRef = doc(collection(db, 'lobbies'), lobbyCode);

      // Create a new lobby in Firestore
      await setDoc(lobbyRef, {
        code: lobbyCode,
        createdAt: new Date(),
        players: [username.trim()], // Add host as the first player
        status: 'waiting', // Lobby is waiting for players
      });

      // Redirect to the lobby screen
      router.push(`/lobby/${lobbyCode}`);
    } catch (err) {
      console.error('Error creating lobby:', err);
      setError('Failed to create lobby. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Enter Your Username</h1>
      <input
        style={styles.input}
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter username"
      />
      {error && <p style={styles.error}>{error}</p>}
      <button style={styles.button} onClick={joinLobby}>
        Join Lobby
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
    padding: '20px',
  },
  header: {
    fontSize: '2.5em',
    marginBottom: '20px',
  },
  input: {
    padding: '10px',
    fontSize: '1.2em',
    marginBottom: '20px',
    width: '80%',
    maxWidth: '400px',
    border: '1px solid #ccc',
    borderRadius: '5px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '1.2em',
    backgroundColor: '#0070f3',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  error: {
    color: 'red',
    marginBottom: '20px',
  },
};

export default JoinLobbyScreen;
