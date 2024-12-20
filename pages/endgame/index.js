import React from 'react';

const EndGamePage = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Game Over!</h1>
      <p style={styles.subtitle}>Thank you for playing Dad Bingo.</p>
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
    fontSize: '3em',
    marginBottom: '20px',
  },
  subtitle: {
    fontSize: '1.5em',
    marginBottom: '30px',
  },
  button: {
    padding: '15px 30px',
    backgroundColor: '#0070f3',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
  },
};

export default EndGamePage;
