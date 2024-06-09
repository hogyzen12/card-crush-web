import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function HomeScreen() {
  const navigate = useNavigate();
  const [prizePool, setPrizePool] = useState(0);

  useEffect(() => {
    const fetchPrizePool = async () => {
      try {
        const response = await fetch('https://radial-tame-snow.solana-mainnet.quiknode.pro/f02bf8d532bcad89e4758a5e5540fb988debdcd2/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getTokenAccountBalance',
            params: ['Ez4AUa9SYqTQvg7o8y8vTvQAmjoBqCfVuuMF1L9Eg147'],
          }),
        });

        const data = await response.json();
        const bonkAmount = data.result.value.uiAmount / 1; // Convert from lamports to BONK
        setPrizePool(bonkAmount);
      } catch (error) {
        console.error('Error fetching prize pool:', error);
      }
    };

    fetchPrizePool();
  }, []);

  const handlePress = (target: string) => {
    navigate(target);
  };

  return (
    <div className="bg-black flex flex-col items-center justify-center min-h-screen text-white">
      {/* Navigation Bar */}
      <div className="w-full flex justify-around items-center bg-gray-800 py-4">
        <button onClick={() => handlePress('/how-to-play')} className="button-primary">How to Play</button>
        <button onClick={() => handlePress('/bonkgame')} className="button-primary">BONK Game!</button>
        <button onClick={() => handlePress('/leaderboard')} className="button-primary">Leaderboard</button>
        <div className="prize-pool-display ml-4">BONK Prize Pool: {prizePool.toLocaleString()} BONK</div>
      </div>

      <img
        src="/assets/homepage.webp" // Path to the new generated image
        alt="Anime Character and Shiba Inu"
        className="w-full h-auto mb-8"
      />
    </div>
  );
}

export default HomeScreen;

/*<button onClick={() => handlePress('/game')} className="button-primary">Game</button>*/