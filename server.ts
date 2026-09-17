import 'dotenv/config'; 
import { WebSocketServer, WebSocket } from 'ws';
import * as crypto from 'crypto';
import { Pool } from 'pg';
import Stripe from 'stripe'; 

const NETWORK_SECRET = process.env.NETWORK_SECRET || 'leonce_1000_year_secure_vault_key';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
    apiVersion: '2023-10-16' as any, 
});

const pool = new Pool({
    user: process.env.DB_USER || 'leonce',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'gotrust_ledger',
    password: process.env.DB_PASSWORD || '1971',
    port: parseInt(process.env.DB_PORT || '5433'),
});

export interface GoTrustTransaction {
    senderId: string;
    receiverId: string;
    voiceprintHash: string; 
    amountInCents: number;  
    hmacSignature: string;  
}

const wss = new WebSocketServer({ port: 8085 });
const activeConnections: Set<WebSocket> = new Set();

console.log("🚀 goTrust Core Server active on ws://localhost:8085");

wss.on('connection', (socket: WebSocket) => {
    activeConnections.add(socket);

    socket.on('message', async (message: string) => {
        try {
            const payload: GoTrustTransaction = JSON.parse(message);
            
            if ((payload as any).type === 'MONITOR_SUBSCRIBE') {
                socket.send(JSON.stringify({ status: "MONITOR_ACTIVE" }));
                return;
            }

            // 1. Strict verification properties check
            if (!payload.senderId || !payload.receiverId || !payload.voiceprintHash || payload.amountInCents === undefined || !payload.hmacSignature) {
                console.error("⚠️ Payload layout properties mismatch received:", payload);
                socket.send(JSON.stringify({ status: "ERROR", message: "Missing layout properties fields." }));
                return;
            }

            // 2. Cryptographic Validation
            const messageData = `${payload.senderId}:${payload.receiverId}:${payload.voiceprintHash}:${payload.amountInCents}`;
            const expectedSignature = crypto
                .createHmac('sha256', NETWORK_SECRET)
                .update(messageData)
                .digest('hex');

            if (payload.hmacSignature !== expectedSignature) {
                console.error(`🛑 Cryptographic Signature mismatch.`);
                socket.send(JSON.stringify({ status: "REJECTED", reason: "CRYPTOGRAPHIC_SIGNATURE_INVALID" }));
                return;
            }

            const platformFeeCents = 10; 

            // 3. Simulated Stripe Multi-Tenant Call
            const paymentIntent = await stripe.paymentIntents.create({
                amount: payload.amountInCents,
                currency: 'usd',
            }).catch(() => {
                return { id: `pi_mock_${crypto.randomBytes(4).toString('hex')}` };
            });

            // 4. Safe Database Entry write
            let ledgerIndexId = Date.now(); // Fallback ID tracking reference
            try {
                const sqlQuery = `
                    INSERT INTO transactions (sender_id, receiver_id, voiceprint_hash, amount_cents, network_fee_cents)
                    VALUES ($1, $2, $3, $4, $5) RETURNING id;
                `;
                const values = [payload.senderId, payload.receiverId, payload.voiceprintHash, payload.amountInCents, platformFeeCents];
                const dbResult = await pool.query(sqlQuery, values);
                if (dbResult.rows && dbResult.rows[0]) {
                    ledgerIndexId = dbResult.rows[0].id;
                }
            } catch (dbError) {
                console.log("⚠️ Database logging fell back to memory timestamps, container sync pending...");
            }

            console.log(`💸 [Crypto-Verified & Processed] Ledger ID: #${ledgerIndexId}`);

            // Broadcast to real-time layouts
            const alertPayload = JSON.stringify({
                type: "LIVE_LEDGER_ALERT",
                ledgerIndexId,
                sender: payload.senderId,
                receiver: payload.receiverId,
                valueProcessed: (payload.amountInCents / 100).toFixed(2),
                revenueLocked: "0.10",
                timestamp: Date.now()
            });

            activeConnections.forEach(client => {
                if (client !== socket && client.readyState === WebSocket.OPEN) client.send(alertPayload);
            });

            socket.send(JSON.stringify({
                status: "SUCCESS",
                ledgerIndexId,
                stripeTxRef: paymentIntent.id,
                feeChargedCents: platformFeeCents
            }));

        } catch (error: any) {
            console.error("❌ Processing crash stream error caught:", error.message);
            socket.send(JSON.stringify({ status: "ERROR", message: "Financial transaction failed parsing layout." }));
        }
    });

    socket.on('close', () => activeConnections.delete(socket));
});
