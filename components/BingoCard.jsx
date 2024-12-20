import React from 'react';
import Image from 'next/image';

const BingoCard = ({ items, size, selectedTiles, onTileClick }) => {
  if (!items || items.length === 0) {
    return <p>No items available to display the Bingo board.</p>;
  }

  // Determine center index for Free Space
  const centerIndex = Math.floor((size * size) / 2);

  return (
    <div
      style={{
        ...styles.board,
        gridTemplateColumns: `repeat(${size}, 1fr)`,
      }}
    >
      {items.map((item, index) => (
        <div
          key={index}
          onClick={() => onTileClick && onTileClick(index)} // Pass index for tile clicks
          style={{
            ...styles.cell,
            backgroundColor: selectedTiles.includes(index)
              ? '#FFD700' // Highlight selected tiles (gold)
              : index === centerIndex && item === 'Free Space'
              ? '#ccc' // Free Space color
              : '#0070f3', // Default color
          }}
        >
          {index === centerIndex && item === 'Free Space' ? (
            <Image
              src="/images/DadLogo.jpg"
              alt="Free Space"
              layout="fill"
              style={{ objectFit: 'cover', borderRadius: '5px' }}
            />
          ) : (
            item.text || item // Display text for regular tiles
          )}
        </div>
      ))}
    </div>
  );
};

const styles = {
  board: {
    display: 'grid',
    gap: '10px',
    margin: '20px auto',
    width: '80%',
  },
  cell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    padding: '20px',
    fontSize: '1.2em',
    fontWeight: 'bold',
    border: '2px solid #0070f3',
    borderRadius: '5px',
    textAlign: 'center',
    height: '100px',
    position: 'relative', // To support Free Space image placement
    cursor: 'pointer', // Make clickable
    color: 'white', // Text color for readability
  },
};

export default BingoCard;
