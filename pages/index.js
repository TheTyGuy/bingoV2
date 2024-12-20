import React from 'react';
import { useRouter } from 'next/router';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

const HomePage = () => {
  const router = useRouter();

  const createLobby = async () => {
    const hostName = prompt('Enter your username:');
    if (!hostName) return alert('Username is required.');

    const lobbyCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const lobbyRef = doc(db, 'lobbies', lobbyCode);

    try {
      await setDoc(lobbyRef, {
        code: lobbyCode,
        players: {
          [hostName]: { username: hostName, isHost: true },
        },
        createdAt: new Date(),
        bingoList: [],
      });

      localStorage.setItem('userName', hostName);
      localStorage.setItem('lobbyCode', lobbyCode);

      router.push(`/lobby/${lobbyCode}`);
    } catch (err) {
      console.error('Error creating lobby:', err);
      alert('Failed to create lobby. Please try again.');
    }
  };

  const handleMouseEnter = (e) => {
    e.target.style.backgroundColor = 'rgba(84, 55, 245, 0.5)'; // Transparent hover color
    e.target.style.color = 'white'; // Change text color to white
  };

  const handleMouseLeave = (e) => {
    e.target.style.backgroundColor = 'white'; // Default button background
    e.target.style.color = '#0070f3'; // Default text color
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}>
        <h1 style={styles.title}>Welcome to Dad Bingo</h1>
        <p style={styles.subtitle}>
          A fun and interactive way to enjoy bingo with your family and friends!
        </p>
        <div style={styles.buttonContainer}>
          <button
            style={styles.button}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={createLobby}
          >
            Create a Game
          </button>
          <button
            style={styles.button}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => router.push('/join-lobby')}
          >
            Join a Game
          </button>
          <button
            style={styles.button}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => router.push('/rules')}
          >
            How to Play
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundImage: 'url("/images/DadLogo.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: '40px',
    borderRadius: '10px',
    textAlign: 'center',
    maxWidth: '600px',
    color: 'white',
  },
  title: {
    fontSize: '3em',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  subtitle: {
    fontSize: '1.5em',
    marginBottom: '30px',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    flexWrap: 'wrap',
  },
  button: {
    padding: '15px 30px',
    fontSize: '1.2em',
    fontWeight: 'bold',
    color: '#0070f3',
    backgroundColor: 'white',
    border: '2px solid #0070f3',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease-in-out',
    margin: '10px',
  },
};

export default HomePage;
