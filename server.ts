import 'dotenv/config'; 
import { WebSocketServer, WebSocket } from 'ws';
import * as crypto from 'crypto';
import { Pool } from 'pg';

const NETWORK_SECRET = process.env.NETWORK_SECRET || 'fallback_key_safe';

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

// 🟢 Track all open connections (clients, hackers, dashboards, analytics channels)
const activeConnections: Set<WebSocket> = new Set();

console.log("🚀 goTrust Streaming Node is LIVE on ws://localhost:8080");
console.log("📡 Real-time ledger event broadcasting activated...");

wss.on('connection', (socket: WebSocket) => {
    // Add the new connection to our tracking registry
    activeConnections.add(socket);
    console.log(`🔌 [Network Stream Built] Active connection pool size: ${activeConnections.size}`);

    socket.on('message', async (message: string) => {
        try {
            const payload: GoTrustTransaction = JSON.parse(message);
            
            // Skip structural parsing if it's just a passive monitor system saying hello
            if ((payload as any).type === 'MONITOR_SUBSCRIBE') {
                socket.send(JSON.stringify({ status: "MONITOR_ACTIVE" }));
                return;
            }

            if (!payload.senderId || !payload.receiverId || !payload.voiceprintHash || payload.amountInCents === undefined || !payload.hmacSignature) {
                throw new Error("PROT_ERR: Missing layout fields.");
            }

            // Cryptographic Validation
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
            const ledgerIndexId = dbResult.rows[0].id; // Fixed object array index lookup row mapping

            console.log(`\n💸 [Crypto-Verified & Saved to Ledger Row #${ledgerIndexId}]`);

            // Build the automated broadcast announcement package
            const alertPayload = JSON.stringify({
                type: "LIVE_LEDGER_ALERT",
                ledgerIndexId: ledgerIndexId,
                sender: payload.senderId,
                receiver: payload.receiverId,
                valueProcessed: (payload.amountInCents / 100).toFixed(2),
                revenueLocked: (platformFeeCents / 100).toFixed(2),
                timestamp: Date.now()
            });

            // 🟢 THE BROADCAST STEP: Send this live update to EVERY single system link simultaneously
            activeConnections.forEach((client) => {
                if (client !== socket && client.readyState === WebSocket.OPEN) {
                    client.send(alertPayload);
                }
            });

            // Send confirmation back to original transaction submitter
            socket.send(JSON.stringify({
                status: "SUCCESS",
                ledgerIndexId: ledgerIndexId,
                feeChargedCents: platformFeeCents
            }));

        } catch (error) {
            console.error("❌ Protocol Failure:", error);
            socket.send(JSON.stringify({ status: "ERROR", message: "Invalid system validation parameters." }));
        }
    });

    socket.on('close', () => {
        // Remove connection from stream registry once disconnected
        activeConnections.delete(socket);
        console.log(`🔌 [Link Severed] Active connection pool size: ${activeConnections.size}`);
    });
});
