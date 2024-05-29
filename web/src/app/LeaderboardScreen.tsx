import React, { useEffect, useState } from "react";
import { atom, useRecoilState } from "recoil";
import { View, Text, FlatList, StyleSheet, Button } from "react-native";
import { Connection, PublicKey } from '@solana/web3.js';

const LAMPORTS_PER_SOL = 1000000000; // Number of lamports in one SOL

interface LeaderboardItem {
  signer: string;
  total_points: number;
  total_cards: number;
  entry_rate: string; // New field
  streak: number; // New field
}

interface EntryItem {
  seed: string;
  points: number;
  cards_collected: number;
  date: string; // New field
}

const poolState = atom<number>({
  key: 'poolState',
  default: 0,
});

export function LeaderboardScreens(): JSX.Element {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardItem[]>([]);
  const [userEntries, setUserEntries] = useState<EntryItem[]>([]);
  const [balance, setBalance] = useRecoilState(poolState);
  const [showingMyEntries, setShowingMyEntries] = useState(false);

  const userPublicKey = "mpSDUxUmbWixs9TfJS5JUj7KRWMiVEqsSU3zdKVvSyHq";

  useEffect(() => {
    fetchLeaderboardData();
    if (userPublicKey) {
      fetchUserEntries(userPublicKey);
    }
  }, [userPublicKey]);

  const fetchLeaderboardData = async () => {
    try {
      const response = await fetch('https://solanagetaccount.info/leaderboard');
      const data = await response.json();
      setLeaderboardData(data.leaderboard);
    } catch (error) {
      console.error('Failed to fetch leaderboard data:', error);
    }
  };

  const fetchUserEntries = async (publicKey: string) => {
    try {
      const response = await fetch(`https://solanagetaccount.info/entries/${publicKey}`);
      const data = await response.json();
      setUserEntries(data.entries); // Assuming the API returns an array of entries
    } catch (error) {
      console.error('Failed to fetch user entries:', error);
    }
  };

  useEffect(() => {
    const connection = new Connection('https://damp-fabled-panorama.solana-mainnet.quiknode.pro/186133957d30cece76e7cd8b04bce0c5795c164e/');
    const prizePoolPublicKey = new PublicKey('crushpRpFZ7r36fNfCMKHFN4SDvc7eyXfHehVu34ecW');

    async function fetchBalance() {
      try {
        const lamports = await connection.getBalance(prizePoolPublicKey);
        const sol = lamports / LAMPORTS_PER_SOL;
        setBalance(sol);
      } catch (error) {
        console.error('Error fetching balance', error);
      }
    }

    fetchBalance();
  }, []);

  const handleShowMyEntries = () => {
    setShowingMyEntries(!showingMyEntries);
  };

  const truncateString = (str: string): string => {
    return str.substring(0, 4) + "..";
  };

  const LeaderboardHeader = (): JSX.Element => (
    <View style={styles.leaderboardHeader}>
      <Text style={styles.headerText}>Rank</Text>
      <Text style={styles.headerText}>Key</Text>
      <Text style={styles.headerText}>Points</Text>
      <Text style={styles.headerText}>Cards</Text>
      <Text style={styles.headerText}>Entry Rate</Text> {/* New */}
      <Text style={styles.headerText}>Streak</Text> {/* New */}
    </View>
  );

  const renderLeaderboardItem = ({ item, index }: { item: LeaderboardItem; index: number }): JSX.Element => (
    <View style={styles.leaderboardItem}>
      <Text style={styles.itemText}>{index + 1}</Text>
      <Text style={styles.itemText}>{truncateString(item.signer)}</Text>
      <Text style={styles.itemText}>{item.total_points}</Text>
      <Text style={styles.itemText}>{item.total_cards}</Text>
      <Text style={styles.itemText}>{item.entry_rate}</Text> {/* New */}
      <Text style={styles.itemText}>{item.streak}</Text> {/* New */}
    </View>
  );

  const renderUserEntries = (): JSX.Element => {
    if (userEntries.length === 0) {
      return <Text>No entries found for this user.</Text>;
    }

    return (
      <>
        <LeaderboardHeader />
        {userEntries.map((item, index) => (
          <View key={index} style={styles.leaderboardItem}>
            <Text style={styles.itemText}>{index + 1}</Text>
            <Text style={styles.itemText}>{truncateString(item.seed)}</Text>
            <Text style={styles.itemText}>{item.points}</Text>
            <Text style={styles.itemText}>{item.cards_collected}</Text>
            <Text style={styles.itemText}>{item.date}</Text> {/* New */}
          </View>
        ))}
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* Display Prize Pool Balance */}
      <View style={styles.prizePoolContainer}>
        <Text style={styles.prizeTitle}>Prize Pool Balance: {balance.toFixed(2)} SOL</Text>
      </View>
      {/* Existing UI elements remain unchanged */}
      <Button
        title={showingMyEntries ? "Show All Entries" : "Show Just My Entries"}
        onPress={handleShowMyEntries}
      />
      {!showingMyEntries ? (
        <>
          <LeaderboardHeader />
          <FlatList
            data={leaderboardData}
            renderItem={renderLeaderboardItem}
            keyExtractor={(item, index) => 'leaderboard' + item.signer + index}
          />
        </>
      ) : (
        renderUserEntries()
      )}
      <Button title="Refresh Leaderboard" onPress={fetchLeaderboardData} />
    </View>
  );
}

// Adjusted styles to include the leaderboard header and column alignment
const styles = StyleSheet.create({
  leaderboardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  leaderboardItem: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1, // Ensures equal spacing
  },
  itemText: {
    fontSize: 16,
    flex: 2, // Ensures alignment with headers
  },
  container: {
    flex: 1,
    marginTop: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  header: {
    fontWeight: "bold",
    flex: 1,
    textAlign: 'center', // Ensure text is centered within each column
  },
  column: {
    flex: 1,
    textAlign: 'center', // Ensure text is centered, improving alignment
  },
  prizePoolContainer: {
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prizeTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});
