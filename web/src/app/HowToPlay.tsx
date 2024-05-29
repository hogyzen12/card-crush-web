import React from 'react';

export function HowToPlay() {
  return (
    <div className="bg-black flex flex-col items-center justify-center min-h-screen text-white p-4">
      <h1 className="text-4xl font-bold mt-4 mb-6">How to Play</h1>
      
      <div className="max-w-3xl w-full">
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-3xl font-bold mb-4">Match Cards</h2>
          <p className="text-lg">Combine three or more cards of the same type to unlock special cards.</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-3xl font-bold mb-4">Collect Cards</h2>
          <p className="text-lg">Gather as many cards and special cards as you can to win.</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-3xl font-bold mb-4">Submit Scores</h2>
          <p className="text-lg">Submit your scores on the blockchain to get rewarded with BONK.</p>
        </div>

        <div className="bg-yellow-500 p-6 rounded-lg text-black">
          <h2 className="text-3xl font-bold mb-4">What's New?</h2>

          <div className="mb-4">
            <h3 className="text-2xl font-bold">BONK Rewards</h3>
            <p className="text-lg">We purchased 100 Million BONK to reward players. Rewards are based on the formula: BONK received = total points x streak + cards x entry rate.</p>
          </div>

          <div className="mb-4">
            <h3 className="text-2xl font-bold">Daily Play</h3>
            <p className="text-lg">A new layout goes live every day at midnight UTC.</p>
          </div>

          <div>
            <h3 className="text-2xl font-bold">Streak Mechanic</h3>
            <p className="text-lg">Show up daily to build a streak. Consistent players get the most points, highest streak, and highest rewards.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HowToPlay;