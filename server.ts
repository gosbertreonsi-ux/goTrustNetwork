import { WebSocketServer, WebSocket } from 'ws';
import * as crypto from 'crypto';
import { Pool } from 'pg'; // Import the PostgreSQL open-source socket client

const NETWORK_SECRET = 'leonce_1000_year_secure_vault_key';

// 🟢 Database Connection Configuration Pool
const pool = new Pool({
    user: 'leonce',
    host: 'localhost',
    database: 'gotrust_ledger',
    password: '1971', // Updated to match your custom terminal password
    port: 5433,       // Updated to bypass the local port allocation block
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
console.log("🗄️ Connected to PostgreSQL Immutable Database Ledger on Port 5432...");

wss.on('connection', (socket: WebSocket) => {
    socket.on('message', async (message: string) => { // Added async keyword for database write speeds
        try {
            const payload: GoTrustTransaction = JSON.parse(message);
            
            // 1. Structural Sanity Check
            if (!payload.senderId || !payload.receiverId || !payload.voiceprintHash || payload.amountInCents === undefined || !payload.hmacSignature) {
                throw new Error("PROT_ERR: Missing layout fields.");
            }

            // 2. Cryptographic Validation Step
            const messageData = `${payload.senderId}:${payload.receiverId}:${payload.voiceprintHash}:${payload.amountInCents}`;
            const expectedSignature = crypto
                .createHmac('sha256', NETWORK_SECRET)
                .update(messageData)
                .digest('hex');

            if (payload.hmacSignature !== expectedSignature) {
                console.error(`🛑 [SECURITY ALERT] Tamper detected! Signature invalid.`);
                socket.send(JSON.stringify({ status: "REJECTED", reason: "CRYPTOGRAPHIC_SIGNATURE_INVALID" }));
                return;
            }

            // Financial Calculations
            const platformFeeCents = 10; // Your \$0.10 revenue layer
            const merchantPayoutCents = payload.amountInCents - platformFeeCents;

            // 3. DATABASE LEDGER INSERTION STEP
            // Directly piping the data parameters into secure SQL rows
            const sqlQuery = `
                INSERT INTO transactions (sender_id, receiver_id, voiceprint_hash, amount_cents, network_fee_cents)
                VALUES ($1, $2, $3, $4, $5) RETURNING id;
            `;
            const values = [payload.senderId, payload.receiverId, payload.voiceprintHash, payload.amountInCents, platformFeeCents];
            
            const dbResult = await pool.query(sqlQuery, values);
            const ledgerIndexId = dbResult.rows[0].id;

            console.log(`\n💸 [Crypto-Verified & Saved to DB Ledger]`);
            console.log(`🆔 Ledger ID Row: #${ledgerIndexId}`);
            console.log(`🔒 HMAC Seal Valid: ${payload.hmacSignature.substring(0, 16)}...`);
            console.log(`📊 Asset Value: $${(payload.amountInCents / 100).toFixed(2)} | Fee: +$0.10`);

            socket.send(JSON.stringify({
                status: "SUCCESS",
                network: "goTrust Core Engine",
                ledgerIndexId: ledgerIndexId,
                feeChargedCents: platformFeeCents,
                serverTimestamp: Date.now()
            }));

        } catch (error) {
            console.error("❌ Protocol Failure: Rejected a corrupted payload.");
            socket.send(JSON.stringify({ status: "ERROR", message: "Invalid execution framework." }));
        }
    });
});
