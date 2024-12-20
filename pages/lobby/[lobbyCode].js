import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';

const LobbyScreen = () => {
  const router = useRouter();
  const { lobbyCode } = router.query;
  const [lobby, setLobby] = useState(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const storedUserName = localStorage.getItem('userName') || '';
    setUserName(storedUserName);

    if (lobbyCode) {
      const lobbyRef = doc(db, 'lobbies', lobbyCode);

      const unsubscribe = onSnapshot(lobbyRef, (docSnap) => {
        if (docSnap.exists()) {
          const lobbyData = docSnap.data();
          setLobby(lobbyData);

          // Navigate to list screen when listReady becomes true
          if (lobbyData.listReady) {
            router.push(`/collaborative-list/${lobbyCode}`);
          }
        } else {
          console.error(`Lobby "${lobbyCode}" not found in Firestore.`);
        }
      });

      return () => unsubscribe(); // Cleanup on unmount
    }
  }, [lobbyCode, router]);

  const handleEverybodyIn = async () => {
    const lobbyRef = doc(db, 'lobbies', lobbyCode);
    try {
      await updateDoc(lobbyRef, {
        listReady: true,
      });
    } catch (err) {
      console.error('Error starting the list:', err);
    }
  };

  return (
    <div style={styles.container}>
      {lobby ? (
        <>
          <h1 style={styles.header}>Lobby Code: {lobbyCode}</h1>
          <h2>Players:</h2>
          <ul style={styles.playerList}>
            {Object.values(lobby.players).map((player, index) => (
              <li key={index}>
                {player.username} {player.isHost && '(Host)'}
              </li>
            ))}
          </ul>

          {/* Show the start button only for the host */}
          {lobby.players[userName]?.isHost && (
            <button style={styles.button} onClick={handleEverybodyIn}>
              Everybody&#39;s In
            </button>
          )}
        </>
      ) : (
        <p>Loading lobby...</p>
      )}
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
  playerList: {
    listStyleType: 'none',
    padding: '0',
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
};

export default LobbyScreen;
