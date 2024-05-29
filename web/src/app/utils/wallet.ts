// utils/wallet.ts
import { Connection, PublicKey } from '@solana/web3.js';

export const getWalletBalance = async (
  connection: Connection,
  publicKey: PublicKey
): Promise<number> => {
  const balance = await connection.getBalance(publicKey);
  console.log(balance)
  return balance / 1e9; // Convert lamports to SOL
};
