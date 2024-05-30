import { Connection, PublicKey, TransactionMessage, VersionedTransaction, ComputeBudgetProgram, SystemProgram, LAMPORTS_PER_SOL, TransactionInstruction } from '@solana/web3.js';
import axios from 'axios';
import bs58 from 'bs58';
import { Buffer } from 'buffer';

const JITO_URL = "https://mainnet.block-engine.jito.wtf/api/v1/transactions";
const TIP_ACCOUNTS = [
  { address: "juLesoSmdTcRtzjCzYzRoHrnF8GhVu6KCV7uxq7nJGp", amount: 100_000 },
  { address: "DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL", amount: 100_000 },
];

async function sendTransactionJito(serializedTransaction: Uint8Array): Promise<string> {
  const encodedTx = bs58.encode(serializedTransaction);
  const payload = {
    jsonrpc: "2.0",
    id: 1,
    method: "sendTransaction",
    params: [encodedTx],
  };

  try {
    const response = await axios.post(JITO_URL, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data.result;
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Cannot send transaction!");
  }
}

export async function createPaymentTx(
  amountSol: number,
  destinationAddress: string,
  senderPublicKey: PublicKey,
  memoContent: string, // New parameter for memo content
  signTransaction: (transaction: VersionedTransaction) => Promise<VersionedTransaction>,
  connection: Connection
): Promise<string> {
  const amountLamports = amountSol * LAMPORTS_PER_SOL;
  const toAccount = new PublicKey(destinationAddress);

  const blockhash = await connection.getLatestBlockhash();

  const config = {
    units: 20000,
    microLamports: 100_000,
  };

  const instructions = [
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: config.microLamports }),
    //ComputeBudgetProgram.setComputeUnitLimit({ units: config.units }),
    SystemProgram.transfer({
      fromPubkey: senderPublicKey,
      toPubkey: toAccount,
      lamports: amountLamports,
    }),
  ];

  // Add tip instructions
  TIP_ACCOUNTS.forEach((tip) =>
    instructions.push(
      SystemProgram.transfer({
        fromPubkey: senderPublicKey,
        toPubkey: new PublicKey(tip.address),
        lamports: tip.amount,
      })
    )
  );

  // Add the memo instruction after the transfer instruction
  const memoProgramId = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
  const memoInstruction = new TransactionInstruction({
    keys: [{ pubkey: senderPublicKey, isSigner: true, isWritable: false }],
    programId: memoProgramId,
    data: Buffer.from(memoContent, "utf-8"),
  });
  instructions.push(memoInstruction);

  const messageV0 = new TransactionMessage({
    payerKey: senderPublicKey,
    recentBlockhash: blockhash.blockhash,
    instructions,
  }).compileToV0Message();

  const transaction = new VersionedTransaction(messageV0);

  // Sign the transaction using the wallet adapter
  const signedTransaction = await signTransaction(transaction);
  const rawTransaction = signedTransaction.serialize();

  return await sendTransactionJito(rawTransaction);
}
