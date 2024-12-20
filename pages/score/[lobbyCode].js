import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../lib/firebase';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';

const ScoreScreen = () => {
  const router = useRouter();
  const { lobbyCode } = router.query;

  const [gameData, setGameData] = useState(null);
  const [userName, setUserName] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState(null);
  const [votes, setVotes] = useState({});

  // Logging Helper
  const debugLog = (message, data) => console.log(`[DEBUG]: ${message}`, data);

  // Fetch Game Data
  useEffect(() => {
    if (!lobbyCode) return;

    const gameRef = doc(db, 'games', lobbyCode);

    const unsubscribe = onSnapshot(gameRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        debugLog('Fetched Game Data:', data);
        setGameData(data);
        setVotes(data.votes || {});
      } else {
        debugLog('Game Data Not Found.');
        setGameData(null);
      }
    });

    return () => unsubscribe();
  }, [lobbyCode]);

  // Fetch Username and Host Status from Local Storage
  useEffect(() => {
    const storedUserName = localStorage.getItem('userName') || 'Guest';
    setUserName(storedUserName);
    debugLog('Fetched Username:', storedUserName);

    if (gameData?.players?.[userName]?.isHost) {
        setIsHost(true);
      }
     
  }, [gameData]);

  const castVote = async (vote) => {
    if (isHost) return; // Host should not cast votes

    const gameRef = doc(db, 'games', lobbyCode);

    try {
      await updateDoc(gameRef, {
        [`votes.${userName}`]: vote,
      });
      debugLog(`Vote Cast: ${vote} by ${userName}`);
    } catch (err) {
      console.error('Error Casting Vote:', err);
      setError('Failed to cast vote.');
    }
  };

  const handleHostAction = async (action) => {
    if (!isHost) return; // Only host can perform actions

    const gameRef = doc(db, 'games', lobbyCode);

    try {
      if (action === 'play_again') {
        // Reset the game for a new round
        await updateDoc(gameRef, {
          currentBingoBoard: null,
          bingoCaller: null,
          votes: {},
          gameStarted: false, // Reset game state
        });

        router.push(`/game/${lobbyCode}`);
      } else if (action === 'update_list') {
        // Redirect to the collaborative list screen
        router.push(`/collaborative-list/${lobbyCode}`);
      } else if (action === 'quit') {
        // Save final scores and end the game
        const endGameRef = doc(db, 'games', `${lobbyCode}-end`);

        await setDoc(endGameRef, {
          players: gameData.players,
          finalScores: Object.entries(gameData.players).map(([name, { score }]) => ({
            name,
            score: score || 0,
          })),
          endedAt: new Date(),
        });

        router.push(`/end-game/${lobbyCode}`); // Redirect to end game screen
      }
    } catch (err) {
      console.error('Error Handling Host Action:', err);
      setError('Failed to perform action.');
    }
  };

  if (!gameData) return <p>Loading game data...</p>;

  const players = Object.entries(gameData.players || {})
    .filter(([key]) => key !== 'null') // Filter out null users
    .map(([name, data]) => ({ name, score: data.score || 0 }));

  return (
    <div style={styles.container}>
      <h1>Score Screen</h1>
      <ul style={styles.playerList}>
        {players.map((player) => (
          <li key={player.name}>
            {player.name}: {player.score} points
            {votes[player.name] && <span> - {votes[player.name]}</span>}
          </li>
        ))}
      </ul>
      {isHost ? (
        <div style={styles.hostButtons}>
          <button
            style={styles.hostButton}
            onClick={() => handleHostAction('play_again')}
          >
            Play Again
          </button>
          <button
            style={styles.hostButton}
            onClick={() => handleHostAction('update_list')}
          >
            Update List
          </button>
          <button
            style={styles.hostButton}
            onClick={() => handleHostAction('quit')}
          >
            Quit
          </button>
        </div>
      ) : (
        <div style={styles.voteButtons}>
          <p>Your Vote: {votes[userName] || 'Not Cast'}</p>
          <button
            style={styles.voteButton}
            onClick={() => castVote('play_again')}
          >
            Play Again
          </button>
          <button
            style={styles.voteButton}
            onClick={() => castVote('update_list')}
          >
            Update List
          </button>
          <button style={styles.voteButton} onClick={() => castVote('quit')}>
            Quit
          </button>
        </div>
      )}
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  playerList: {
    listStyle: 'none',
    padding: '0',
    marginBottom: '20px',
  },
  hostButtons: {
    marginTop: '20px',
  },
  hostButton: {
    padding: '10px 20px',
    margin: '5px',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  voteButtons: {
    marginTop: '20px',
  },
  voteButton: {
    padding: '10px 20px',
    margin: '5px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginTop: '20px',
  },
};

export default ScoreScreen;
