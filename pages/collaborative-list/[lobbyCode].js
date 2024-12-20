import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../lib/firebase';
import {
  doc,
  updateDoc,
  arrayUnion,
  onSnapshot,
  setDoc,
  collection,
} from 'firebase/firestore';

const CollaborativeListScreen = () => {
  const router = useRouter();
  const { lobbyCode } = router.query;

  const [bingoList, setBingoList] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [error, setError] = useState(null);
  const [difficulty, setDifficulty] = useState('Medium');
  const [userName, setUserName] = useState('');
  const [isHost, setIsHost] = useState(false);

  const difficultySizes = {
    Easy: 8,    // 3x3 - 1 free space
    Medium: 24, // 5x5 - 1 free space
    Hard: 48,   // 7x7 - 1 free space
  };

  useEffect(() => {
    const storedUserName = localStorage.getItem('userName') || '';
    setUserName(storedUserName);

    if (lobbyCode) {
      const listRef = doc(db, 'lobbies', lobbyCode);

      const unsubscribe = onSnapshot(listRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setBingoList(data.bingoList || []);
          setIsHost(data.players[storedUserName]?.isHost || false);

          // Redirect players when the game starts
          if (data.gameStarted) {
            router.push(`/game/${lobbyCode}`);
          }
        }
      });

      return () => unsubscribe(); // Cleanup on unmount
    }
  }, [lobbyCode, router]);

  const addItemToList = async () => {
    if (!newItem.trim()) {
      setError('Item cannot be empty');
      return;
    }

    const listRef = doc(db, 'lobbies', lobbyCode);

    try {
      await updateDoc(listRef, {
        bingoList: arrayUnion(newItem.trim()),
      });
      setNewItem(''); // Clear input
      setError(null); // Clear error
    } catch (err) {
      console.error('Error adding item:', err);
      setError('Failed to add item. Please try again.');
    }
  };

  const startGame = async () => {
    const requiredItems = difficultySizes[difficulty];

    if (bingoList.length < requiredItems) {
      setError(
        `You need at least ${requiredItems} items for ${difficulty} difficulty.`
      );
      return;
    }

    try {
      const gameRef = doc(collection(db, 'games'), lobbyCode);
      await setDoc(gameRef, {
        bingoList,
        difficulty,
        createdAt: new Date(),
      });

      // Update Firestore to mark game as started only after successful creation
      const listRef = doc(db, 'lobbies', lobbyCode);
      await updateDoc(listRef, {
        gameStarted: true,
      });
    } catch (err) {
      console.error('Error starting game:', err);
      setError('Failed to start game. Please try again.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      addItemToList();
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Collaborative Bingo List</h1>

      <div style={styles.inputContainer}>
        <input
          style={styles.input}
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a new item"
        />
        <button style={styles.addButton} onClick={addItemToList}>
          Add
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <ul style={styles.list}>
        {bingoList.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      {isHost && (
        <>
          <div style={styles.difficultyContainer}>
            <h3>Select Difficulty:</h3>
            <label>
              <input
                type="radio"
                name="difficulty"
                value="Easy"
                checked={difficulty === 'Easy'}
                onChange={(e) => setDifficulty(e.target.value)}
              />
              Easy (3x3)
            </label>
            <label>
              <input
                type="radio"
                name="difficulty"
                value="Medium"
                checked={difficulty === 'Medium'}
                onChange={(e) => setDifficulty(e.target.value)}
              />
              Medium (5x5)
            </label>
            <label>
              <input
                type="radio"
                name="difficulty"
                value="Hard"
                checked={difficulty === 'Hard'}
                onChange={(e) => setDifficulty(e.target.value)}
              />
              Hard (7x7)
            </label>
          </div>
          <button style={styles.startButton} onClick={startGame}>
            Start Game
          </button>
        </>
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
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    fontSize: '2em',
    marginBottom: '20px',
  },
  inputContainer: {
    display: 'flex',
    marginBottom: '20px',
  },
  input: {
    padding: '10px',
    fontSize: '1em',
    marginRight: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
  },
  addButton: {
    padding: '10px 20px',
    fontSize: '1em',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginBottom: '20px',
  },
  list: {
    listStyleType: 'none',
    padding: '0',
    marginBottom: '20px',
  },
  difficultyContainer: {
    marginBottom: '20px',
  },
  startButton: {
    padding: '10px 20px',
    fontSize: '1.2em',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default CollaborativeListScreen;
