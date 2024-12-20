// src/AppRoutes.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage'; // Ensure this matches your folder structure

// Placeholder pages to create later
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';
import CollaborativeListPage from './pages/CollaborativeListPage';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lobby/:lobbyCode" element={<LobbyPage />} />
        <Route path="/game/:lobbyCode" element={<GamePage />} />
        <Route path="/collaborative-list/:lobbyCode" element={<CollaborativeListPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
