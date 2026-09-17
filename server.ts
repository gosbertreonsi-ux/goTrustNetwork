import 'dotenv/config'; // 🟢 Dynamically pulls secrets from your .env file instantly
import { WebSocketServer, WebSocket } from 'ws';
import * as crypto from 'crypto';
import { Pool } from 'pg';

// Fallback to a baseline safe key if the .env configuration is missing
const NETWORK_SECRET = process.env.NETWORK_SECRET || 'fallback_key_safe';

// 🟢 Database Pool now completely anonymized using system variables
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});

export interface GoTrustTransaction {
    senderId: string;
    receiverId: string;
    voiceprintHash: string; 
    amountInCents: number;  
    hmacSignature: string;  
}

const wss = new WebSocketServer({ port: 8080 });

console.log("🚀 goTrust Cryptographic Node is LIVE on ws://localhost:8080");
console.log("🔒 Running on fully anonymized environment secrets pipeline.");

wss.on('connection', (socket: WebSocket) => {
    socket.on('message', async (message: string) => {
        try {
            const payload: GoTrustTransaction = JSON.parse(message);
            
            if (!payload.senderId || !payload.receiverId || !payload.voiceprintHash || payload.amountInCents === undefined || !payload.hmacSignature) {
                throw new Error("PROT_ERR: Missing layout fields.");
            }

            // Cryptographic Validation using the hidden key variables
            const messageData = `${payload.senderId}:${payload.receiverId}:${payload.voiceprintHash}:${payload.amountInCents}`;
            const expectedSignature = crypto
                .createHmac('sha256', NETWORK_SECRET)
                .update(messageData)
                .digest('hex');

            if (payload.hmacSignature !== expectedSignature) {
                console.error(`🛑 [SECURITY ALERT] Tamper detected!`);
                socket.send(JSON.stringify({ status: "REJECTED", reason: "CRYPTOGRAPHIC_SIGNATURE_INVALID" }));
                return;
            }

            const platformFeeCents = 10; 
            
            const sqlQuery = `
                INSERT INTO transactions (sender_id, receiver_id, voiceprint_hash, amount_cents, network_fee_cents)
                VALUES ($1, $2, $3, $4, $5) RETURNING id;
            `;
            const values = [payload.senderId, payload.receiverId, payload.voiceprintHash, payload.amountInCents, platformFeeCents];
            
            const dbResult = await pool.query(sqlQuery, values);
            const ledgerIndexId = dbResult.rows[0].id; // Fixed row lookup index mapping

            console.log(`\n💸 [Crypto-Verified & Saved to Anonymized DB Ledger]`);
            console.log(`🆔 Ledger ID Row: #${ledgerIndexId} | Fee Collected: +$0.10`);

            socket.send(JSON.stringify({
                status: "SUCCESS",
                network: "goTrust Core Engine",
                ledgerIndexId: ledgerIndexId,
                feeChargedCents: platformFeeCents,
                serverTimestamp: Date.now()
            }));

        } catch (error) {
            console.error("❌ Protocol Failure: Rejected a corrupted payload.", error);
            socket.send(JSON.stringify({ status: "ERROR", message: "Invalid execution framework." }));
        }
    });
});
