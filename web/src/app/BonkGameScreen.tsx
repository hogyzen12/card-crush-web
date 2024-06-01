import React, { useEffect } from "react";
import { atom, useRecoilState } from "recoil";
import { Connection, PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { getWalletBalance } from './utils/wallet';
import { createBonkTx } from './transactionBonk';
import axios from 'axios';
import matchGif from '../assets/match.gif'; // Import the GIF file

const connection = new Connection('https://damp-fabled-panorama.solana-mainnet.quiknode.pro/186133957d30cece76e7cd8b04bce0c5795c164e/');

const deepCopyBoard = (originalBoard: number[][]): number[][] => {
  return originalBoard.map(row => [...row]);
};

const gridRows = 5;
const gridCols = 5;
const matchGifIndex = 42;

const candyImages = [
  "assets/backpack.png",
  "assets/bonk.png",
  "assets/jules.png",
  "assets/nyla.png",
  "assets/otter.png",
  "assets/tetsu.png",
  matchGif
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

const showNotificationState = atom({
  key: 'showNotificationState',
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

const animationBoardState = atom({
  key: 'animationBoardState',
  default: generateBoardFromSeed(currentSeed),
});

export function BonkGameScreen() {
  const { publicKey, signTransaction } = useWallet();
  const [transactionStatus, setTransactionStatus] = useRecoilState(transactionStatusState);
  const [transactionProcessing, setTransactionProcessing] = useRecoilState(transactionProcessingState);
  const [showNotification, setShowNotification] = useRecoilState(showNotificationState);
  const [board, setBoard] = useRecoilState(boardState);
  const [matchCount, setMatchCount] = useRecoilState(matchCountState);
  const [turnCount, setTurnCount] = useRecoilState(turnCountState);
  const [selectedTile, setSelectedTile] = useRecoilState(selectedTileState);
  const [moves, setMoves] = useRecoilState(movesState);
  const [balance, setBalance] = useRecoilState(balanceState);
  const [signature, setSignature] = useRecoilState(signatureState);
  const [currentSeed, setCurrentSeed] = useRecoilState(currentSeedState);
  const [animationBoard, setAnimationBoard] = useRecoilState(animationBoardState);

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
    if (turnCount >= 23) {
      setShowNotification(true);
    } else {
      setShowNotification(false);
    }
  }, [turnCount]);

  useEffect(() => {
    const fetchCurrentSeed = async () => {
      try {
        const response = await fetch('https://solanagetaccount.info/bonk_current_seed', {
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
          setAnimationBoard(newBoard); // Initialize animation board
        }
      } catch (error) {
        console.error('Error fetching current seed:', error);
      }
    };

    fetchCurrentSeed();
  }, [setCurrentSeed, setBoard, setAnimationBoard]);

  const generateSeedBoard = () => {
    const newBoard = generateBoardFromSeed(currentSeed);
    setTransactionStatus('Idle')
    setBoard(newBoard);
    setAnimationBoard(newBoard);
    setMatchCount(0);
    setTurnCount(0);
    setMoves([]);
  };

  const getReplacementIndices = (matchedIndex: number): number[] => {
    const previousIndex = matchedIndex - 1 < 0 ? candyImages.length - 2 : matchedIndex - 1;
    const nextIndex = (matchedIndex + 1) % (candyImages.length - 1);

    return [previousIndex, candyImages.length - 2, nextIndex];
  };

  const detectAndReplaceMatches = (newBoard: number[][]) => {
    let matches = 0;

    const replaceCandies = (mutableBoard: number[][], row: number, col: number, rowInc: number, colInc: number, len: number, matchedType: number) => {
      let indices = getReplacementIndices(matchedType);
      mutableBoard[row][col] = indices[0];
      for (let i = 1; i < len - 1; i++) {
        mutableBoard[row + i * rowInc][col + i * colInc] = indices[1];
      }
      mutableBoard[row + (len - 1) * rowInc][col + (len - 1) * colInc] = indices[2];
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
      setAnimationBoard(prevAnimationBoard => {
        const updatedAnimationBoard = deepCopyBoard(prevAnimationBoard);
        for (let i = 0; i < len; i++) {
          updatedAnimationBoard[row + i * rowInc][col + i * colInc] = matchGifIndex;
        }
        return updatedAnimationBoard;
      });
      setTimeout(() => {
        const mutableBoard = deepCopyBoard(newBoard);
        replaceCandies(mutableBoard, row, col, rowInc, colInc, len, baseValue);
        setBoard(mutableBoard);
        setAnimationBoard(mutableBoard);
      }, 790); // Delay in milliseconds for animation
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
      matches: matches
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

        setBoard(newBoard); // Set the board first to show the swap
        setAnimationBoard(newBoard);

        const matchesFound = detectAndReplaceMatches(newBoard);
        const matchCount = matchesFound.matches;

        if (matchCount > 0) {
          setMatchCount(prevCount => prevCount + matchCount);
        } else {
          setBoard(newBoard); // Update the board even if no match is found
        }

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
    const receiver = new PublicKey("Ez4AUa9SYqTQvg7o8y8vTvQAmjoBqCfVuuMF1L9Eg147");
    const memoContent = `${matchCount}|${currentSeed}|${moves.join("|")}`;
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
      const txid = await createBonkTx(
        receiver.toString(),
        publicKey,
        memoContent, // Pass the memo content
        signTransaction,
        connection
      );
  
      console.log("Transaction ID:", txid);
      setSignature(txid); // Set the signature state with the transaction ID
      setTransactionStatus('Transaction created. Waiting for confirmation...');
  
      const QUICKNODE_URL = "https://damp-fabled-panorama.solana-mainnet.quiknode.pro/186133957d30cece76e7cd8b04bce0c5795c164e/";
  
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
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for 5 seconds before each check
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
    <div className="centered-container bg-black min-h-screen p-4">
      <div className="w-full flex flex-col items-center text-white mb-4">
        <span className="text-lg font-bold">Turn: {turnCount}/24</span>
        <span className="text-lg font-bold">Points: {matchCount}</span>
      </div>
      <div className="flex justify-center items-center flex-1">
        <div className="grid grid-cols-5 gap-2">
          {animationBoard.map((row, rowIndex) => (
            <div key={rowIndex} className="flex flex-col">
              {row.map((candyIndex, colIndex) => (
                <button
                  key={colIndex}
                  onClick={() => handleTilePress(rowIndex, colIndex)}
                  className={`w-16 h-16 md:w-20 md:h-20 ${
                    selectedTile &&
                    selectedTile.row === rowIndex &&
                    selectedTile.col === colIndex
                      ? "opacity-50"
                      : ""
                  }`}
                >
                  <img
                    src={candyIndex === matchGifIndex ? matchGif : candyImages[candyIndex]}
                    alt={`Candy ${candyIndex}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      {showNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded">
          You can now submit!
        </div>
      )}
      <div className="flex flex-col items-center mt-8 space-y-4">
        <button
          onClick={generateSeedBoard}
          className="btn-large bg-gold text-black rounded-full font-bold border-2 border-gold hover:bg-black hover:text-gold transition-colors duration-300"
        >
          Reset
        </button>
        <button
          onClick={entrySubmit}
          className="btn-large bg-gold text-black rounded-full font-bold border-2 border-gold hover:bg-black hover:text-gold transition-colors duration-300"
          disabled={turnCount < 2}
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
};
