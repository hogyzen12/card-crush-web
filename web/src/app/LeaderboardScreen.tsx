import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { getWalletBalance } from './utils/wallet';
import { PublicKey } from '@solana/web3.js';

interface LeaderboardEntry {
  signer: string;
  total_points: number;
  total_cards: number;
  entry_rate: string;
  streak: number;
}

interface UserEntry {
  seed: string;
  points: number;
  cards_collected: number;
  date: string;
}

interface UserEntries {
  entries: UserEntry[];
}

export function LeaderboardScreen() {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [userEntries, setUserEntries] = useState<UserEntry[]>([]);
  const [balance, setBalance] = useState(0);
  const [prizePool, setPrizePool] = useState(0);
  const [showUserEntries, setShowUserEntries] = useState(false);

  useEffect(() => {
    fetchLeaderboardData();
    fetchPrizePool();
  }, [publicKey]);

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

  const fetchLeaderboardData = async () => {
    try {
      const response = await fetch('https://solanagetaccount.info/leaderboard');
      const data = await response.json();
      console.log('Leaderboard data:', data);
      setLeaderboardData(data.leaderboard);
    } catch (error) {
      console.error('Failed to fetch leaderboard data:', error);
    }
  };

  const fetchUserEntries = async (publicKey: string) => {
    try {
      const response = await fetch(`https://solanagetaccount.info/entries/${publicKey}`);
      const data: UserEntries = await response.json();
      setUserEntries(data.entries || []);
    } catch (error) {
      console.error('Failed to fetch user entries:', error);
    }
  };

  const fetchWalletData = async () => {
    try {
      if (publicKey) {
        const balance = await getWalletBalance(connection, publicKey);
        setBalance(balance);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    }
  };

  const toggleView = () => {
    if (!showUserEntries && publicKey) {
      fetchUserEntries(publicKey.toString());
    }
    setShowUserEntries(!showUserEntries);
  };

  const formatSigner = (signer: string) => {
    if (!signer) return '';
    return `${signer.slice(0, 4)}...${signer.slice(-4)}`;
  };

  const dataToDisplay = showUserEntries ? userEntries : leaderboardData;

  return (
    <div className="bg-black flex flex-col items-center justify-center min-h-screen text-white p-4">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-4">BONK Prize Pool: {prizePool.toLocaleString()} BONK</h2>
        <table className="min-w-full bg-gray-800">
          <thead>
            <tr>
              <th className="py-2 px-4">Rank</th>
              <th className="py-2 px-4">Signer</th>
              <th className="py-2 px-4">Total Points</th>
              <th className="py-2 px-4">Total Cards</th>
              <th className="py-2 px-4">Entry Rate</th>
              <th className="py-2 px-4">Streak</th>
            </tr>
          </thead>
          <tbody>
            {!showUserEntries ? (
              leaderboardData.map((entry, index) => (
                <tr key={entry.signer} className="bg-gray-700 even:bg-gray-600">
                  <td className="py-2 px-4">{index + 1}</td>
                  <td className="py-2 px-4 break-all">{formatSigner(entry.signer)}</td>
                  <td className="py-2 px-4">{entry.total_points}</td>
                  <td className="py-2 px-4">{entry.total_cards}</td>
                  <td className="py-2 px-4">{entry.entry_rate}</td>
                  <td className="py-2 px-4">{entry.streak}</td>
                </tr>
              ))
            ) : (
              userEntries.map((entry, index) => (
                <tr key={entry.seed} className="bg-gray-700 even:bg-gray-600">
                  <td className="py-2 px-4">{index + 1}</td>
                  <td className="py-2 px-4 break-all">{formatSigner(entry.seed)}</td>
                  <td className="py-2 px-4">{entry.points}</td>
                  <td className="py-2 px-4">{entry.cards_collected}</td>
                  <td className="py-2 px-4">{entry.date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={fetchLeaderboardData}
        className="btn-large bg-gold text-black rounded-full font-bold border-2 border-gold hover:bg-black hover:text-gold transition-colors duration-300 mt-8 px-6 py-3"
      >
        Refresh Leaderboard
      </button>

      <button
        onClick={toggleView}
        className="btn-large bg-gold text-black rounded-full font-bold border-2 border-gold hover:bg-black hover:text-gold transition-colors duration-300 mt-4 px-6 py-3"
      >
        {showUserEntries ? 'Show Leaderboard' : 'Show My Entries'}
      </button>
    </div>
  );
}

export default LeaderboardScreen;
