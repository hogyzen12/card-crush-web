import React, { useEffect } from "react";
import { atom, useRecoilState } from "recoil";
import { Connection, PublicKey, SystemProgram, Transaction, TransactionInstruction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { getWalletBalance } from './utils/wallet';
import { createPaymentTx } from './transaction';
import axios from 'axios';

const connection = new Connection('https://damp-fabled-panorama.solana-mainnet.quiknode.pro/186133957d30cece76e7cd8b04bce0c5795c164e/');

const deepCopyBoard = (originalBoard: number[][]): number[][] => {
  return originalBoard.map(row => row.slice());
};

const gridRows = 5;
const gridCols = 5;

const candyImages = [
  "assets/backpack.png",
  "assets/bonk.png",
  "assets/jules.png",
  "assets/nyla.png",
  "assets/otter.png",
  "assets/tetsu.png",
  "assets/metame.gif"
];

let currentSeed = "3oLQ3tFiwrD1w1FXU6j7hmHLyYv5suye5Ek9cCKYomNZHxhiDKprMSb3rU3UKRq9v3HMTmzjMVUg79Y5ygHtffkL";

const generateBoardFromSeed = (currentSeed: string): number[][] => {
  let board = Array.from({ length: gridRows }, () => Array(gridCols).fill(0));
  for (let i = 0; i < gridRows; i++) {
    for (let j = 0; j < gridCols; j++) {
      const seedChar = currentSeed[i * gridRows + j];
      board[i][j] = seedChar.charCodeAt(0) % 6;
    }
  }
  return board;
};

const transactionStatusState = atom({
  key: 'transactionStatusState',
  default: 'Idle',
});

const transactionProcessingState = atom({
  key: 'transactionProcessingState',
  default: false,
});

const boardState = atom({
  key: 'boardState',
  default: generateBoardFromSeed(currentSeed),
});

const matchCountState = atom({
  key: 'matchCountState',
  default: 0,
});

const cardCollectedState = atom({
  key: 'cardCollectedState',
  default: 0,
});

const turnCountState = atom({
  key: 'turnCountState',
  default: 0,
});

const selectedTileState = atom({
  key: 'selectedTileState',
  default: null as { row: number, col: number } | null,
});

const movesState = atom({
  key: 'movesState',
  default: [] as string[],
});

const balanceState = atom({
  key: 'balanceState',
  default: 0,
});

const signatureState = atom({
  key: 'signatureState',
  default: "",
});

const currentSeedState = atom({
  key: 'currentseedState',
  default: currentSeed,
});

export function GameScreen() {
  const { publicKey, signTransaction } = useWallet();
  const [transactionStatus, setTransactionStatus] = useRecoilState(transactionStatusState);
  const [transactionProcessing, setTransactionProcessing] = useRecoilState(transactionProcessingState);
  const [board, setBoard] = useRecoilState(boardState);
  const [matchCount, setMatchCount] = useRecoilState(matchCountState);
  const [cardCollectedCount, setcardCollectedCount] = useRecoilState(cardCollectedState);
  const [turnCount, setTurnCount] = useRecoilState(turnCountState);
  const [selectedTile, setSelectedTile] = useRecoilState(selectedTileState);
  const [moves, setMoves] = useRecoilState(movesState);
  const [balance, setBalance] = useRecoilState(balanceState);
  const [signature, setSignature] = useRecoilState(signatureState);
  const [currentSeed, setCurrentSeed] = useRecoilState(currentSeedState);

  useEffect(() => {
    if (publicKey) {
      fetchWalletData();
    }
  }, [publicKey]);

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

  useEffect(() => {
    const fetchCurrentSeed = async () => {
      try {
        const response = await fetch('https://solanagetaccount.info/current_seed', {
          method: 'GET',
          headers: {
            accept: 'application/json',
          },
        });
        const data = await response.json();
        
        if (data && data.current_seed) {
          setCurrentSeed(data.current_seed);
          const newBoard = generateBoardFromSeed(data.current_seed);
          setBoard(newBoard);
        }
      } catch (error) {
        console.error('Error fetching current seed:', error);
      }
    };

    fetchCurrentSeed();
  }, [setCurrentSeed, setBoard]);

  const generateSeedBoard = () => {
    const newBoard = generateBoardFromSeed(currentSeed);
    setTransactionStatus('Idle')
    setBoard(newBoard);
    setMatchCount(0);
    setcardCollectedCount(0);
    setTurnCount(0);
    setMoves([]);
  };

  const getReplacementIndices = (matchedIndex: number, totalMatches: number): number[] => {
    if (matchedIndex < 0 || matchedIndex >= candyImages.length - 1) {
      throw new Error('Invalid candy index');
    }

    if (matchedIndex === candyImages.length - 1) {
      if (totalMatches % 2 === 0) {
        return [0, 1, 2];
      } else {
        return [3, 4, 5];
      }
    }

    const previousIndex = matchedIndex - 1 < 0 ? candyImages.length - 2 : matchedIndex - 1;
    const nextIndex = (matchedIndex + 1) % (candyImages.length - 1);

    return [previousIndex, candyImages.length - 1, nextIndex];
  };

  const detectAndReplaceMatches = (newBoard: number[][]) => {
    let matches = 0;
    let cardMatches = 0;
    let specialCardMatches = 0;

    const replaceCandies = (row: number, col: number, rowInc: number, colInc: number, len: number, matchedType: number) => {
      let indices;
      if (matchedType === candyImages.length - 1 && len === 3) {
        if (colInc !== 0) {
          newBoard[row][col] = 0;
          newBoard[row][col + colInc] = 1;
          newBoard[row][col + 2 * colInc] = 2;
        } else {
          newBoard[row][col] = 5;
          newBoard[row + rowInc][col] = 4;
          newBoard[row + 2 * rowInc][col] = 3;
        }
        cardMatches += len;
        specialCardMatches += len;
        console.log("cardMatches: " + cardMatches);
        console.log("specialCardMatches: " + specialCardMatches);
      } else {
        indices = getReplacementIndices(matchedType, cardMatches);
        newBoard[row][col] = indices[0];
        for (let i = 1; i < len - 1; i++) {
          newBoard[row + i * rowInc][col + i * colInc] = indices[1];
        }
        newBoard[row + (len - 1) * rowInc][col + (len - 1) * colInc] = indices[2];
      }
    };



    const matchAndReplace = (row: number, col: number, rowInc: number, colInc: number, len: number) => {
      let baseValue = newBoard[row][col];
      let replace = false;

      for (let i = 1; i < len; i++) {
        if (newBoard[row + i * rowInc][col + i * colInc] !== baseValue) {
          replace = false;
          break;
        }
        replace = true;
      }

      if (replace) {
        matches += len;
        replaceCandies(row, col, rowInc, colInc, len, baseValue);
      }

      return replace;
    };

    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        for (let len = gridCols; len >= 3; len--) {
          if (col + len <= gridCols && matchAndReplace(row, col, 0, 1, len)) break;
          if (row + len <= gridRows && matchAndReplace(row, col, 1, 0, len)) break;
        }
      }
    }

    return {
      matches: matches,
      specialMatches: specialCardMatches
    };
  };

  const handleTilePress = (rowIndex: number, colIndex: number) => {
    if (turnCount >= 24) {
      console.log("Turn limit reached. No more moves allowed.");
      return;
    }

    const recordMove = (startTile: { row: number, col: number }, direction: string) => {
      const colLetter = String.fromCharCode(97 + startTile.col);
      const move = `${colLetter}${startTile.row + 1}${direction}`;
      setMoves(prevMoves => {
        const updatedMoves = [...prevMoves, move];
        console.log(updatedMoves);
        return updatedMoves;
      });
    };

    if (selectedTile) {
      const rowDiff = Math.abs(rowIndex - selectedTile.row);
      const colDiff = Math.abs(colIndex - selectedTile.col);

      const isAdjacentHorizontally = (rowDiff === 0 && colDiff === 1);
      const isAdjacentVertically = (colDiff === 0 && rowDiff === 1);

      if (isAdjacentHorizontally || isAdjacentVertically) {
        const newBoard = deepCopyBoard(board);
        const temp = newBoard[rowIndex][colIndex];
        newBoard[rowIndex][colIndex] = newBoard[selectedTile.row][selectedTile.col];
        newBoard[selectedTile.row][selectedTile.col] = temp;

        const matchesFound = detectAndReplaceMatches(newBoard);
        const matchCount = matchesFound.matches;

        if (matchCount > 0) {
          setMatchCount(prevCount => prevCount + matchCount);
        }

        const cardCollectedCount = matchesFound.specialMatches;
        if (cardCollectedCount > 0) {
          setcardCollectedCount(prevCount => prevCount + cardCollectedCount);
        }

        setBoard(newBoard);
        setTurnCount(prevTurnCount => prevTurnCount + 1);

        if (isAdjacentHorizontally) {
          if (colIndex > selectedTile.col) {
            recordMove(selectedTile, 'r');
          } else {
            recordMove(selectedTile, 'l');
          }
        } else if (isAdjacentVertically) {
          if (rowIndex > selectedTile.row) {
            recordMove(selectedTile, 's');
          } else {
            recordMove(selectedTile, 'n');
          }
        }
      }

      setSelectedTile(null);
    } else {
      setSelectedTile({ row: rowIndex, col: colIndex });
    }
  };

  const entrySubmit = async () => {
    const receiver = new PublicKey("crushpRpFZ7r36fNfCMKHFN4SDvc7eyXfHehVu34ecW");
    const memoContent = `${matchCount}|${cardCollectedCount}|${currentSeed}|${moves.join("|")}`;
    console.log(memoContent);
  
    if (!publicKey) {
      console.error("Public key is null");
      return;
    }
  
    if (!signTransaction) {
      console.error("signTransaction function is undefined");
      return;
    }
  
    try {
      setTransactionStatus('Creating transaction...');
      setTransactionProcessing(true); // Set transaction processing to true
      const txid = await createPaymentTx(
        0.0042, // Amount in SOL
        receiver.toString(),
        publicKey,
        memoContent, // Pass the memo content
        signTransaction,
        connection
      );
  
      console.log("Transaction ID:", txid);
      setSignature(txid); // Set the signature state with the transaction ID
      setTransactionStatus('Transaction created. Waiting for confirmation...');
  
      const QUICKNODE_URL = "https://radial-tame-snow.solana-mainnet.quiknode.pro/f02bf8d532bcad89e4758a5e5540fb988debdcd2/";
  
      async function getTransactionStatus(txid: string): Promise<any> {
        const payload = {
          jsonrpc: "2.0",
          id: 1,
          method: "getTransaction",
          params: [txid, { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 }]
        };
  
        try {
          const response = await axios.post(QUICKNODE_URL, payload, {
            headers: { "Content-Type": "application/json" },
          });
          return response.data.result;
        } catch (error) {
          console.error("Error:", error);
          throw new Error("Cannot get transaction status!");
        }
      }
  
      // Poll for transaction status
      let status;
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 2500)); // Wait for 5 seconds before each check
        setTransactionStatus(`Checking transaction status... (attempt ${i + 1})`);
        status = await getTransactionStatus(txid);
        console.log(status);
        if (status) {
          setTransactionStatus(`TX confirmed! Explorer link: <a href="https://solscan.io/tx/${txid}" target="_blank" rel="noopener noreferrer"> TX Link</a>`);
          setTransactionProcessing(false); // Set transaction processing to false
          break;
        }
      }
  
      if (!status) {
        setTransactionStatus('Transaction not confirmed after multiple attempts.');
        setTransactionProcessing(false); // Set transaction processing to false
      }
    } catch (error) {
      console.error("Error submitting entry:", error);
      setTransactionStatus('Error submitting transaction.');
      setTransactionProcessing(false); // Set transaction processing to false
    }
  };

  return (
    <div className="bg-black flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full flex justify-around text-white mb-4">
        <span className="text-lg font-bold">Turn: {turnCount}/24</span>
        <span className="text-lg font-bold">Cards: {cardCollectedCount}</span>
        <span className="text-lg font-bold">Points: {matchCount}</span>
      </div>
      <div className="flex justify-center items-center flex-1">
        <div className="grid grid-cols-5 gap-2">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="flex flex-col">
              {row.map((candyIndex, colIndex) => (
                <button
                  key={colIndex}
                  onClick={() => handleTilePress(rowIndex, colIndex)}
                  className={`w-16 h-16 md:w-20 md:h-20 ${selectedTile && selectedTile.row === rowIndex && selectedTile.col === colIndex ? "opacity-50" : ""}`}
                >
                  <img src={candyImages[candyIndex]} alt={`Candy ${candyIndex}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center items-center mt-8 space-x-8">
        {turnCount > 23 && !signature && (
          <span className="text-green-500 text-center mt-2">You can now submit!</span>
        )}
        <button 
          onClick={generateSeedBoard} 
          className="btn-large bg-gold text-black rounded-full font-bold border-2 border-gold hover:bg-black hover:text-gold transition-colors duration-300"
        >
          Reset
        </button>
        <button 
          onClick={entrySubmit} 
          className="btn-large bg-gold text-black rounded-full font-bold border-2 border-gold hover:bg-black hover:text-gold transition-colors duration-300" 
          disabled={turnCount < 23 || !!signature}
        >
          Submit
        </button>
      </div>
      <div className="text-white mb-4" dangerouslySetInnerHTML={{ __html: transactionStatus }}></div>
      {transactionProcessing && (
        <div className="flex justify-center items-center">
          <img src={"assets/load.gif"} alt="Loading..." />
        </div>
      )}
    </div>
  );  
}
