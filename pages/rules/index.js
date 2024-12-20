import React from 'react';

const RulesPage = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>How to Play Dad Bingo</h1>
      <ul style={styles.rulesList}>
        <li>Each player takes turns selecting a space.</li>
        <li>The goal is to complete a line on your Bingo card.</li>
        <li>Players can vote on certain actions during the game.</li>
        <li>The first to complete a line wins!</li>
      </ul>
      <button style={styles.button} onClick={() => window.location.href = '/'}>
        Return to Home
      </button>
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '2.5em',
    marginBottom: '20px',
  },
  rulesList: {
    textAlign: 'left',
    margin: '0 auto',
    maxWidth: '600px',
    marginBottom: '30px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#0070f3',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default RulesPage;
