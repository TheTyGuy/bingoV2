import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../lib/firebase';
import { doc, onSnapshot, updateDoc, increment } from 'firebase/firestore';
import VoteCard from '../../components/VoteCard';

const VoteScreen = () => {
  const router = useRouter();
  const { lobbyCode } = router.query;

  const [gameData, setGameData] = useState(null);
  const [userName, setUserName] = useState('');
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(60);

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
      } else {
        debugLog('Game Data Not Found.');
        setGameData(null);
      }
    });

    return () => unsubscribe();
  }, [lobbyCode]);

  // Fetch Username from Local Storage
  useEffect(() => {
    const storedUserName = localStorage.getItem('userName') || 'Guest';
    setUserName(storedUserName);
    debugLog('Fetched Username:', storedUserName);
  }, []);

  // Countdown Timer
  useEffect(() => {
    if (!gameData?.currentBingoBoard) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev > 0) return prev - 1;
        clearInterval(timer); // Stop Timer
        return 0;
      });
    }, 1000);

    return () => clearInterval(timer); // Cleanup
  }, [gameData]);

  // Finalize Vote After Countdown Ends or All Votes are Cast
  useEffect(() => {
    if (countdown === 0 || allVotesCast()) finalizeVote();
  }, [countdown, gameData]);

  const allVotesCast = () => {
    const { players = {}, votes = {} } = gameData || {};
    const totalVoters = Object.keys(players).length - 1; // Exclude the caller
    const voteCount = Object.keys(votes || {}).length;
    return voteCount >= totalVoters;
  };

  const finalizeVote = async () => {
    if (!gameData) return;

    const { votes = {}, bingoCaller } = gameData;
    const approveCount = Object.values(votes || {}).filter((vote) => vote === 'approve').length;
    const rejectCount = Object.values(votes || {}).filter((vote) => vote === 'reject').length;

    const gameRef = doc(db, 'games', lobbyCode);

    try {
      if (approveCount >= rejectCount || approveCount === 0) {
        // Bingo Approved
        await updateDoc(gameRef, {
          [`players.${bingoCaller}.score`]: increment(1),
          currentBingoBoard: null,
          bingoCaller: null,
          votes: {},
        });
        debugLog('Bingo Approved! Redirecting...');
        router.push(`/score/${lobbyCode}`);
      } else {
        // Bingo Rejected
        await updateDoc(gameRef, {
          currentBingoBoard: null,
          bingoCaller: null,
          votes: {},
        });
        debugLog('Bingo Rejected! Redirecting...');
        router.push(`/game/${lobbyCode}`);
      }
    } catch (err) {
      console.error('Error Finalizing Vote:', err);
      setError('Failed to finalize the vote.');
    }
  };

  const castVote = async (vote) => {
    if (!gameData || gameData.bingoCaller === userName) return;

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

  useEffect(() => {
    if (gameData?.currentBingoBoard) {
      debugLog('Rendering Bingo Board:', gameData.currentBingoBoard);
    }
  }, [gameData]);

  if (!gameData) return <p>Loading game data...</p>;

  const { bingoCaller, currentBingoBoard, players } = gameData;

  const isHost = players?.[userName]?.isHost;

  const handleHostAction = async (action) => {
    const gameRef = doc(db, 'games', lobbyCode);
    try {
      if (action === 'play_again') {
        // Reset game for replay
        await updateDoc(gameRef, {
          currentBingoBoard: null,
          bingoCaller: null,
          votes: {},
        });
        router.push(`/game/${lobbyCode}`);
      } else if (action === 'update_list') {
        // Redirect to the collaborative list
        router.push(`/collaborative-list/${lobbyCode}`);
      } else if (action === 'quit') {
        // End game and announce winner
        router.push(`/end/${lobbyCode}`);
      }
    } catch (err) {
      console.error('Error handling host action:', err);
      setError('Failed to perform host action.');
    }
  };

  return (
    <div style={styles.container}>
      <h1>Vote on {bingoCaller}&apos;s Board</h1>
      {currentBingoBoard && currentBingoBoard.length > 0 ? (
        <VoteCard board={currentBingoBoard} />
      ) : (
        <p>No board to display. Please check Firestore.</p>
      )}
      <p>Time remaining: {countdown}s</p>
      {bingoCaller !== userName && (
        <div style={styles.voteButtons}>
          <button style={styles.approveButton} onClick={() => castVote('approve')}>
            Approve
          </button>
          <button style={styles.rejectButton} onClick={() => castVote('reject')}>
            Reject
          </button>
        </div>
      )}
      {isHost && (
        <div style={styles.hostButtons}>
          <button style={styles.hostButton} onClick={() => handleHostAction('play_again')}>
            Play Again
          </button>
          <button style={styles.hostButton} onClick={() => handleHostAction('update_list')}>
            Update List
          </button>
          <button style={styles.hostButton} onClick={() => handleHostAction('quit')}>
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
  voteButtons: {
    marginTop: '20px',
  },
  approveButton: {
    padding: '10px 20px',
    marginRight: '10px',
    backgroundColor: 'green',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  rejectButton: {
    padding: '10px 20px',
    backgroundColor: 'red',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  hostButtons: {
    marginTop: '30px',
  },
  hostButton: {
    padding: '10px 20px',
    marginRight: '10px',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  error: {
    color: 'red',
    marginTop: '20px',
  },
};

export default VoteScreen;
