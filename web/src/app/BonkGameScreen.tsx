import React, { useEffect, useState } from "react";
import { atom, useRecoilState } from "recoil";
import { Connection, PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { getWalletBalance } from './utils/wallet';
import { createBonkTx } from './transactionBonk';
import axios from 'axios';
import { CSSProperties } from 'react';

const connection = new Connection('https://damp-fabled-panorama.solana-mainnet.quiknode.pro/186133957d30cece76e7cd8b04bce0c5795c164e/');

const deepCopyBoard = (originalBoard: number[][]): number[][] => {
  return originalBoard.map(row => [...row]);
};

const gridRows = 6;
const gridCols = 6;
const matchGifIndex = 42;
const initialTurnLimit = 24;

const candyImages = [
  "assets/newcards/air.PNG",
  "assets/newcards/bck.PNG",
  "assets/newcards/bnk.PNG",
  "assets/newcards/fre.PNG",
  "assets/newcards/inu.PNG",
  "assets/newcards/jls.PNG",
  "assets/newcards/jto.PNG",
  "assets/newcards/nyl.PNG",
  "assets/newcards/ott.PNG",
  "assets/newcards/thn.PNG",
  "assets/newcards/tts.PNG",
  "assets/newcards/unr.PNG",
  "assets/newcards/wtr.PNG"
];

const candyGifs = [
  "assets/animations/burn.gif",
  "assets/animations/burn.gif",
  "assets/animations/burn.gif",
  "assets/animations/burn.gif",
  "assets/animations/burn.gif",
  "assets/animations/burn.gif",
  "assets/animations/burn.gif",
  "assets/animations/burn.gif",
  "assets/animations/burn.gif",
  "assets/animations/burn.gif",
  "assets/animations/burn.gif",
  "assets/animations/burn.gif",
  "assets/animations/burn.gif"
];

const activateSound = new Audio("assets/audio/activate.mp3");
const backgroundMusic = new Audio("assets/audio/backing.mp3");
backgroundMusic.loop = true;
const muteIcon = "assets/mute.png"
const unmuteIcon = "assets/unmute.png"

let currentSeed = "3oLQ3tFiwrD1w1FXU6j7hmHLyYv5suye5Ek9cCKYomNZHxhiDKprMSb3rU3UKRq9v3HMTmzjMVUg79Y5ygHtffkL";

const generateBoardFromSeed = (currentSeed: string): number[][] => {
  let board = Array.from({ length: gridRows }, () => Array(gridCols).fill(0));
  for (let i = 0; i < gridRows; i++) {
    for (let j = 0; j < gridCols; j++) {
      //const seedChar = currentSeed[i * gridRows + j];
      const seedChar = currentSeed[(i * gridRows + j) % currentSeed.length];
      board[i][j] = seedChar.charCodeAt(0) % candyImages.length;
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

const turnLimitState = atom({
  key: 'turnLimitState',
  default: initialTurnLimit,
});

export function BonkGameScreen() {
  const { publicKey, signTransaction } = useWallet();
  const [transactionStatus, setTransactionStatus] = useRecoilState(transactionStatusState);
  const [transactionProcessing, setTransactionProcessing] = useRecoilState(transactionProcessingState);
  const [showNotification, setShowNotification] = useRecoilState(showNotificationState);
  const [board, setBoard] = useRecoilState(boardState);
  const [matchCount, setMatchCount] = useRecoilState(matchCountState);
  const [turnCount, setTurnCount] = useRecoilState(turnCountState);
  const [turnLimit, setTurnLimit] = useRecoilState(turnLimitState);
  const [selectedTile, setSelectedTile] = useRecoilState(selectedTileState);
  const [moves, setMoves] = useRecoilState(movesState);
  const [balance, setBalance] = useRecoilState(balanceState);
  const [signature, setSignature] = useRecoilState(signatureState);
  const [currentSeed, setCurrentSeed] = useRecoilState(currentSeedState);
  const [animationBoard, setAnimationBoard] = useRecoilState(animationBoardState);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [animateTurn, setAnimateTurn] = useState(false);
  const [animatePoints, setAnimatePoints] = useState(false);

  useEffect(() => {
    if (animateTurn) {
      const timeout = setTimeout(() => setAnimateTurn(false), 1);
      return () => clearTimeout(timeout);
    }
  }, [animateTurn]);

  useEffect(() => {
    if (animatePoints) {
      const timeout = setTimeout(() => setAnimatePoints(false), 1);
      return () => clearTimeout(timeout);
    }
  }, [animatePoints]);

  useEffect(() => {
    // Apply volume to audio elements
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach((audio) => {
      audio.volume = volume;
    });
  }, [volume]);

  useEffect(() => {
    if (publicKey) {
      fetchWalletData();
    }
  }, [publicKey]);

  useEffect(() => {
    // Play background music
    if (!isMuted) {
      backgroundMusic.volume = volume;
      backgroundMusic.play().catch(error => console.error('Error playing background music:', error));
    } else {
      backgroundMusic.pause();
    }
  }, [isMuted, volume]);

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
    if (turnCount >= turnLimit) {
      setShowNotification(true);
    } else {
      setShowNotification(false);
    }
  }, [turnCount, turnLimit]);

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
    setTurnLimit(initialTurnLimit); // Reset turn limit to initial value
  };

  const getReplacementIndices = (matchedIndex: number): number[] => {
    const previousIndex = matchedIndex - 1 < 0 ? candyImages.length - 1 : matchedIndex - 1;
    const nextIndex = (matchedIndex + 1) % candyImages.length;

    return [previousIndex, matchedIndex, nextIndex];
  };

  const replaceCandies = (mutableBoard: number[][], row: number, col: number, rowInc: number, colInc: number, len: number, matchedType: number) => {
    let indices = getReplacementIndices(matchedType);
    mutableBoard[row][col] = indices[0];
    for (let i = 1; i < len - 1; i++) {
      mutableBoard[row + i * rowInc][col + i * colInc] = indices[1];
    }
    mutableBoard[row + (len - 1) * rowInc][col + (len - 1) * colInc] = indices[2];

    //bonk card - update row/column
    if (matchedType === 2) {
      // Special rule for bonk.png (index 1)
      if (rowInc === 0) {
        // Match in a row
        for (let i = 0; i < gridCols; i++) {
          mutableBoard[row][i] = i;
        }
      } else {
        // Match in a column
        for (let i = 0; i < gridRows; i++) {
          mutableBoard[i][col] = i;
        }
      }
    } else if (matchedType === 6) {
      //Jito card - add one more turn
      setTurnLimit(prevLimit => prevLimit + 1);
    } else if (matchedType === 3) {
      //Fire card - burn all cards within one
      const burnRadius = 1;
      const startRow = Math.max(0, row - burnRadius);
      const endRow = Math.min(mutableBoard.length - 1, row + (len - 1) * rowInc + burnRadius);
      const startCol = Math.max(0, col - burnRadius);
      const endCol = Math.min(mutableBoard[0].length - 1, col + (len - 1) * colInc + burnRadius);
  
      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
          if (r >= 0 && r < mutableBoard.length && c >= 0 && c < mutableBoard[0].length) {
            mutableBoard[r][c] = c;
          }
        }
      }
    } else if (matchedType === 9) {
      //thunder card - update any touching t cards on match
      const updateSurrounding = (r: number, c: number, type: number) => {
        const directions = [
          [0, 1], [1, 0], [0, -1], [-1, 0], // horizontal and vertical
          [-1, -1], [-1, 1], [1, -1], [1, 1] // diagonals
        ];
        mutableBoard[r][c] = r;
  
        for (let [dr, dc] of directions) {
          const newRow = r + dr;
          const newCol = c + dc;
  
          if (
            newRow >= 0 && newRow < mutableBoard.length &&
            newCol >= 0 && newCol < mutableBoard[0].length &&
            mutableBoard[newRow][newCol] === type
          ) {
            updateSurrounding(newRow, newCol, type);
          }
        }
      };
  
      const startRow = Math.max(0, row - 1);
      const endRow = Math.min(mutableBoard.length - 1, row + 1);
      const startCol = Math.max(0, col - 1);
      const endCol = Math.min(mutableBoard[0].length - 1, col + len + 1);
  
      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
          if (
            r >= 0 && r < mutableBoard.length &&
            c >= 0 && c < mutableBoard[0].length &&
            mutableBoard[r][c] === 9 // Assuming the matchedType is 3
          ) {
            updateSurrounding(r, c, 9);
          }
        }
      }
    } else if (matchedType === 12) {
      //Water card - update water cards below match
      const updateBelow = (startRow: number, col: number, type: number) => {
        for (let r = startRow; r < mutableBoard.length; r++) {
          if (mutableBoard[r][col] === type) {
            mutableBoard[r][col] = r;
          }
        }
      };
  
      if (rowInc === 0) {
        // Horizontal match
        for (let c = col; c < col + len; c++) {
          updateBelow(row + 1, c, 12);
        }
      } else if (colInc === 0) {
        // Vertical match
        updateBelow(row + len, col, 12);
      }
    } else if (matchedType === 0) {
      //Air card - update air cards above match
      const updateAbove = (endRow: number, col: number, type: number) => {
        for (let r = endRow; r >= 0; r--) {
          if (mutableBoard[r][col] === type) {
            mutableBoard[r][col] = r; 
          }
        }
      };
    
      if (rowInc === 0) {
        // Horizontal match
        for (let c = col; c < col + len; c++) {
          updateAbove(row - 1, c, 0);
        }
      } else if (colInc === 0) {
        // Vertical match
        updateAbove(row - 1, col, 0);
      }
    }
  };

  const detectAndReplaceMatches = (newBoard: number[][]) => {
    let matches = 0;
    let affectedTiles: { row: number, col: number }[] = [];
  
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
  
        for (let i = 0; i < len; i++) {
          affectedTiles.push({ row: row + i * rowInc, col: col + i * colInc });
        }
  
        // Apply special rules and collect additional affected tiles
        const mutableBoard = deepCopyBoard(newBoard);
        replaceCandies(mutableBoard, row, col, rowInc, colInc, len, baseValue);
        for (let i = 0; i < gridRows; i++) {
          for (let j = 0; j < gridCols; j++) {
            if (mutableBoard[i][j] !== newBoard[i][j]) {
              affectedTiles.push({ row: i, col: j });
            }
          }
        }
        // Reflect changes back to newBoard
        newBoard = mutableBoard;
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
  
    if (affectedTiles.length > 0) {
      // Update animation board with all affected tiles
      setAnimationBoard(prevAnimationBoard => {
        const updatedAnimationBoard = deepCopyBoard(prevAnimationBoard);
        affectedTiles.forEach(({ row, col }) => {
          updatedAnimationBoard[row][col] = matchGifIndex;
        });
        return updatedAnimationBoard;
      });
  
      // Play sound effects
      affectedTiles.forEach(({ row, col }) => {
        const baseValue = newBoard[row][col];
        if (baseValue === 0) {
          activateSound.play();
        } else {
          activateSound.play();
        }
      });
  
      setTimeout(() => {
        setBoard(newBoard);
        setAnimationBoard(newBoard);
      }, 420); // Delay in milliseconds for animation
    } else {
      // Update the board immediately if no matches found
      setBoard(newBoard);
      setAnimationBoard(newBoard);
    }
  
    return {
      matches: matches
    };
  };
  
  const handleTilePress = (rowIndex: number, colIndex: number) => {
    if (turnCount >= turnLimit) {
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
  
        // Show the user's move immediately
        setBoard(newBoard);
        setAnimationBoard(newBoard);
  
        // Record the move
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
  
        setTimeout(() => {
          const matchesFound = detectAndReplaceMatches(newBoard);
          const matchCount = matchesFound.matches;
  
          if (matchCount > 0) {
            setMatchCount(prevCount => prevCount + matchCount);
          }
  
          setTurnCount(prevTurnCount => prevTurnCount + 1);
        }, 8); // Slight delay to process matches
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

  const toggleMute = () => {
    setIsMuted(!isMuted);
    setShowVolumeSlider(!showVolumeSlider);
  };

  const boardSize = animationBoard.length;
  const gameBoardStyle: CSSProperties = {
    '--board-size': boardSize,
  } as React.CSSProperties;

  return (
    <div className="game-container">
      <header className="game-header">
        <div className="status-container">
          <div className="status-items">
            <div className={`status-item ${animateTurn ? 'animate-change' : ''}`}>
              Turn: {turnCount}/{turnLimit}
            </div>
            <div className={`status-item ${animatePoints ? 'animate-change' : ''}`}>
              Points: {matchCount}
            </div>
          </div>
          <div className="volume-control-container">
            <button className="volume-button" onClick={toggleMute}>
              <img src={isMuted ? muteIcon : unmuteIcon} alt="Volume Icon" className="volume-icon" />
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="slider"
              style={{ display: isMuted ? 'none' : 'block' }}
            />
          </div>
        </div>
      </header>
      <div className="game-board" style={gameBoardStyle}>
        {animationBoard.map((row, rowIndex) => (
          row.map((candyIndex, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              onClick={() => handleTilePress(rowIndex, colIndex)}
              className={`game-tile ${
                selectedTile &&
                selectedTile.row === rowIndex &&
                selectedTile.col === colIndex
                  ? "selected-tile"
                  : ""
              }`}
            >
              <img
                src={candyIndex === matchGifIndex ? candyGifs[board[rowIndex][colIndex]] : candyImages[candyIndex]}
                alt={`Candy ${candyIndex}`}
              />
            </button>
          ))
        ))}
      </div>
      {showNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded">
          You can now submit!
        </div>
      )}
      <footer className="game-footer">
        <div className="footer-container">
          <div className="button-container">
            <button
              onClick={generateSeedBoard}
              className="btn-large button-primary"
            >
              Reset
            </button>
            <button
              onClick={entrySubmit}
              className="btn-large button-primary"
              disabled={turnCount < turnLimit}
            >
              Submit
            </button>
          </div>
        </div>
      </footer>
      <div className="text-white mb-4" dangerouslySetInnerHTML={{ __html: transactionStatus }}></div>
      {transactionProcessing && (
        <div className="flex justify-center items-center">
          <img src={"assets/load.gif"} alt="Loading..." />
        </div>
      )}
    </div>
  );
};
