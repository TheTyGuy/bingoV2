import React from 'react';

const PlayerList = ({ players, host }) => {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Players in Lobby:</h2>
      <ul style={styles.list}>
        {Object.keys(players).map((playerName) => (
          <li key={playerName} style={styles.listItem}>
            {playerName} {playerName === host && <span style={styles.hostTag}>(Host)</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '1.5em',
    marginBottom: '10px',
  },
  list: {
    listStyleType: 'none',
    padding: '0',
    margin: '0',
  },
  listItem: {
    fontSize: '1.2em',
    margin: '10px 0',
  },
  hostTag: {
    fontWeight: 'bold',
    color: '#0070f3',
    marginLeft: '10px',
  },
};

export default PlayerList;
