import React from 'react';
import { useNavigate } from 'react-router-dom';

export function HomeScreen() {
  const navigate = useNavigate();

  const handlePress = (target: string) => {
    navigate(target);
  };

  return (
    <div className="bg-black flex flex-col items-center justify-center min-h-screen">
      <img
        src="/assets/metame.gif" // Path to the initial GIF
        alt="MetaMe"
        className="w-72 h-72"
      />
      <button
        onClick={() => handlePress('/game')}
        className="bg-yellow-400 mt-8 px-6 py-3 rounded-full text-lg font-bold text-black"
      >
        Card Crush
      </button>
      <button
        onClick={() => handlePress('/leaderboard')}
        className="bg-yellow-400 mt-8 px-6 py-3 rounded-full text-lg font-bold text-black"
      >
        Leaderboard
      </button>
    </div>
  );
}