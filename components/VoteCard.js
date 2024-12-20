import React from 'react';

const VoteCard = ({ board }) => {
  if (!board || board.length === 0) {
    return <p>No board to display.</p>;
  }

  return (
    <div style={styles.board}>
      {board.map((tile, index) => (
        <div
          key={index}
          style={{
            ...styles.cell,
            backgroundColor: tile.isSelected ? '#90ee90' : '#f0f0f0',
            fontWeight: tile.isSelected ? 'bold' : 'normal',
          }}
        >
          {tile.text}
        </div>
      ))}
    </div>
  );
};

const styles = {
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)', // Assuming a 3x3 grid for Easy
    gap: '10px',
    justifyContent: 'center',
    width: '300px',
    margin: '20px auto',
  },
  cell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontSize: '1.5em',
    textAlign: 'center',
    backgroundColor: '#f0f0f0',
    border: '2px solid #0070f3',
    borderRadius: '5px',
  },
};

export default VoteCard;
