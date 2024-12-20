import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import BingoCard from '../../components/BingoCard'; // Assuming this component is reusable

const VoteScreen = () => {
  const router = useRouter();
  const { lobbyCode } = router.query;

  const [callerName, setCallerName] = useState('');
  const [callerBoard, setCallerBoard] = useState([]);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lobbyCode) return;

    const fetchCallerData = async () => {
      try {
        // Fetch game data to find out who called the bingo
        const gameRef = doc(db, 'games', lobbyCode);
        const gameSnap = await getDoc(gameRef);

        if (gameSnap.exists()) {
          const { bingoCaller } = gameSnap.data(); // Assumes "bingoCaller" is stored when Bingo is called
          if (bingoCaller) {
            setCallerName(bingoCaller);

            // Fetch the caller's board and selected tiles
            const playerRef = doc(db, `games/${lobbyCode}/players`, bingoCaller);
            const playerSnap = await getDoc(playerRef);

            if (playerSnap.exists()) {
              const { board, selectedTiles } = playerSnap.data();
              setCallerBoard(board);
              setSelectedTiles(selectedTiles);
            } else {
              setError('Caller data not found.');
            }
          } else {
            setError('No bingo caller found.');
          }
        } else {
          setError('Game data not found.');
        }
      } catch (err) {
        console.error('Error fetching caller data:', err);
        setError('Failed to load bingo data.');
      } finally {
        setLoading(false);
      }
    };

    fetchCallerData();
  }, [lobbyCode]);

  const handleVote = async (vote) => {
    try {
      const voteRef = doc(db, `games/${lobbyCode}/votes`, localStorage.getItem('userName'));
      await updateDoc(voteRef, { vote });
      alert(`You voted: ${vote}`);
      router.push(`/game/${lobbyCode}`); // Redirect back to the game screen
    } catch (err) {
      console.error('Error submitting vote:', err);
      setError('Failed to submit your vote.');
    }
  };

  if (loading) return <p>Loading voting screen...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={styles.container}>
      <h1>Vote on Bingo</h1>
      <p>Review {callerName}&apos;s bingo board and vote below.</p>

      <div style={styles.boardContainer}>
        <BingoCard
          items={callerBoard}
          size={Math.sqrt(callerBoard.length)}
          selectedTiles={selectedTiles} // Highlight the selected tiles
        />
      </div>

      <div style={styles.voteButtons}>
        <button
          style={{ ...styles.button, backgroundColor: 'green' }}
          onClick={() => handleVote('approve')}
        >
          Approve
        </button>
        <button
          style={{ ...styles.button, backgroundColor: 'red' }}
          onClick={() => handleVote('reject')}
        >
          Reject
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    padding: '20px',
  },
  boardContainer: {
    margin: '20px auto',
    width: '80%',
    display: 'flex',
    justifyContent: 'center',
  },
  voteButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '20px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '1rem',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default VoteScreen;
