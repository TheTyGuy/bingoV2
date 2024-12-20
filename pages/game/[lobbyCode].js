import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, collection } from 'firebase/firestore';
import BingoCard from '../../components/BingoCard';

const GameScreen = () => {
  const router = useRouter();
  const { lobbyCode } = router.query;

  const [gameData, setGameData] = useState(null);
  const [board, setBoard] = useState([]);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [players, setPlayers] = useState({});
  const [userName, setUserName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBingo, setIsBingo] = useState(false);

  // Logging Helper
  const debugLog = (message, data) => {
    console.log(`[DEBUG]: ${message}`, data);
  };

  // Generate Bingo Board
  const generateBoard = useCallback((bingoList, difficulty) => {
    const boardSize = { Easy: 9, Medium: 25, Hard: 49 }[difficulty];
    const shuffledList = [...bingoList].sort(() => Math.random() - 0.5);

    const centerIndex = Math.floor(boardSize / 2);
    const boardItems = shuffledList.slice(0, boardSize - 1); // Exclude Free Space
    const fullBoard = [
      ...boardItems.slice(0, centerIndex),
      'Free Space',
      ...boardItems.slice(centerIndex),
    ];

    debugLog('Generated board:', fullBoard);
    return fullBoard.map((item, index) => ({
      id: index,
      text: item,
      isSelected: item === 'Free Space',
    }));
  }, []);

  // Load or Generate Board from Firestore
  const loadBoardFromFirestore = useCallback(async () => {
    const playerRef = doc(db, `games/${lobbyCode}/players`, userName);

    try {
      const playerSnap = await getDoc(playerRef);
      if (playerSnap.exists()) {
        const { board: savedBoard, selectedTiles: savedTiles } = playerSnap.data();
        setBoard(savedBoard);
        setSelectedTiles(savedTiles || []);
        debugLog('Loaded board from Firestore:', { savedBoard, savedTiles });
      } else if (gameData) {
        const newBoard = generateBoard(gameData.bingoList, gameData.difficulty);
        setBoard(newBoard);
        await setDoc(playerRef, { board: newBoard, selectedTiles: [] });
        debugLog('Generated and saved new board:', newBoard);
      }
    } catch (err) {
      console.error('Error loading board from Firestore:', err);
      setError('Failed to load board.');
    } finally {
      setLoading(false);
    }
  }, [lobbyCode, userName, gameData, generateBoard]);

  // Handle Tile Click
  const handleTileClick = async (tileId) => {
    const updatedTiles = board.map((tile) =>
      tile.id === tileId ? { ...tile, isSelected: !tile.isSelected } : tile
    );

    setBoard(updatedTiles);
    const selectedTiles = updatedTiles.filter((tile) => tile.isSelected).map((tile) => tile.id);
    setSelectedTiles(selectedTiles);

    const playerRef = doc(db, `games/${lobbyCode}/players`, userName);
    await updateDoc(playerRef, { selectedTiles });
  };

  // Watch Player Updates in Firestore
  useEffect(() => {
    if (lobbyCode) {
      const playersRef = collection(db, `games/${lobbyCode}/players`);
      const unsubscribe = onSnapshot(playersRef, (snapshot) => {
        const updatedPlayers = {};
        snapshot.forEach((doc) => {
          updatedPlayers[doc.id] = doc.data().selectedTiles.length || 0;
        });
        setPlayers(updatedPlayers);
        debugLog('Updated Players List:', updatedPlayers);
      });

      return () => unsubscribe();
    }
  }, [lobbyCode]);

  // Redirect all players to the vote screen if a Bingo is called
  useEffect(() => {
    if (gameData?.bingoCaller) {
      debugLog('Redirecting all players to vote screen:', gameData.bingoCaller);
      router.push(`/vote/${lobbyCode}`);
    }
  }, [gameData?.bingoCaller, router, lobbyCode]);

  // Check for Bingo
  useEffect(() => {
    if (!board.length) return;

    const size = Math.sqrt(board.length);
    const rows = [];
    const columns = [];
    const diagonals = [[], []];

    board.forEach((tile, index) => {
      const row = Math.floor(index / size);
      const col = index % size;

      rows[row] = rows[row] || [];
      columns[col] = columns[col] || [];

      if (tile.isSelected) {
        rows[row].push(tile);
        columns[col].push(tile);

        if (row === col) diagonals[0].push(tile); // Top-left to bottom-right
        if (row + col === size - 1) diagonals[1].push(tile); // Top-right to bottom-left
      }
    });

    const foundBingo = [rows, columns, diagonals].some((lines) =>
      lines.some((line) => line.length === size)
    );
    setIsBingo(foundBingo);
    debugLog('Checked for Bingo:', { foundBingo });
  }, [board]);

  // Fetch Game Data and Username
  useEffect(() => {
    if (!lobbyCode) return;

    const fetchGameData = async () => {
      const gameRef = doc(db, 'games', lobbyCode);
      try {
        const gameSnap = await getDoc(gameRef);
        if (gameSnap.exists()) {
          const data = gameSnap.data();
          setGameData(data);
          debugLog('Fetched game data:', data);
        } else {
          setError('Game data not found.');
        }
      } catch (err) {
        console.error('Error fetching game data:', err);
        setError('Failed to load game data.');
      }
    };

    const fetchUserName = () => {
      const storedUserName = localStorage.getItem('userName') || 'Guest';
      setUserName(storedUserName);
      debugLog('Fetched username:', storedUserName);
    };

    fetchGameData();
    fetchUserName();
  }, [lobbyCode]);

  // Sync Board after Game Data Fetch
  useEffect(() => {
    if (gameData && userName) {
      loadBoardFromFirestore();
    }
  }, [gameData, userName, loadBoardFromFirestore]);

  if (loading) return <p>Loading game...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>{userName}&apos;s Board</h1>
      <p>{lobbyCode}</p>

      <BingoCard
        items={board}
        size={Math.sqrt(board.length)}
        selectedTiles={selectedTiles}
        onTileClick={handleTileClick}
      />

      <button
        onClick={async () => {
          try {
            const gameRef = doc(db, 'games', lobbyCode);
            await updateDoc(gameRef, {
              bingoCaller: userName,
              currentBingoBoard: board,
              votes: {}
            });
            debugLog('Bingo! Button triggered.');
          } catch (err) {
            console.error('Error setting bingo caller:', err);
            setError('Failed to register bingo call.');
          }
        }}
        disabled={!isBingo}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          fontSize: '1rem',
          backgroundColor: isBingo ? 'green' : 'gray',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: isBingo ? 'pointer' : 'not-allowed',
        }}
      >
        Bingo!
      </button>

      <h2>Current Players:</h2>
      <ul>
        {Object.entries(players).map(([playerName, count]) => (
          <li key={playerName}>{`${playerName}: ${count} tiles selected`}</li>
        ))}
      </ul>
    </div>
  );
};

export default GameScreen;
