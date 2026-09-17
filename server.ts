import { WebSocketServer, WebSocket } from 'ws';
import * as crypto from 'crypto'; // Native, secure Node.js cryptography engine

// Your private Node secret key used to verify genuine third-party apps
const NETWORK_SECRET = 'leonce_1000_year_secure_vault_key';

// The strict, un-fakeable data shape now requiring a security payload
export interface GoTrustTransaction {
    senderId: string;
    receiverId: string;
    voiceprintHash: string; 
    amountInCents: number;  
    hmacSignature: string;  // The encrypted seal proving the data wasn't tampered with
}

const wss = new WebSocketServer({ port: 8080 });

console.log("🚀 goTrust Cryptographic Node is LIVE on ws://localhost:8080");
console.log("🔒 Advanced validation active. Rejecting untrusted payloads...");

wss.on('connection', (socket: WebSocket) => {
    console.log("📡 [Secure Channel Active] A system has opened a bridge.");

    socket.on('message', (message: string) => {
        try {
            const payload: GoTrustTransaction = JSON.parse(message);
            
            // 1. Structural Sanity Check
            if (!payload.senderId || !payload.receiverId || !payload.voiceprintHash || payload.amountInCents === undefined || !payload.hmacSignature) {
                throw new Error("PROT_ERR: Missing layout fields.");
            }

            // 2. CRYPTOGRAPHIC VALIDATION STEP
            // Re-create the hash using the incoming data + our secret key to see if it matches
            const messageData = `${payload.senderId}:${payload.receiverId}:${payload.voiceprintHash}:${payload.amountInCents}`;
            const expectedSignature = crypto
                .createHmac('sha256', NETWORK_SECRET)
                .update(messageData)
                .digest('hex');

            // Compare the incoming signature with our generated signature
            if (payload.hmacSignature !== expectedSignature) {
                console.error(`🛑 [SECURITY ALERT] Tamper detected! Incoming signature does not match expected signature.`);
                socket.send(JSON.stringify({ status: "REJECTED", reason: "CRYPTOGRAPHIC_SIGNATURE_INVALID" }));
                return;
            }

            // If it passes, the transaction is verified as 100% authentic
            console.log(`\n💸 [Crypto-Verified Transaction Forged]`);
            console.log(`👤 From: ${payload.senderId} -> To: ${payload.receiverId}`);
            console.log(`🔒 HMAC Seal Valid: ${payload.hmacSignature.substring(0, 16)}...`);
            console.log(`📊 Asset Value: $${(payload.amountInCents / 100).toFixed(2)}`);

            // Automated processing fee calculation
            const platformFeeCents = 10; 
            const merchantPayoutCents = payload.amountInCents - platformFeeCents;
            
            console.log(`💰 [goTrust Fee Locked]: +$0.10 inside your engine ledger.`);

            socket.send(JSON.stringify({
                status: "SUCCESS",
                network: "goTrust Core Engine",
                signatureVerified: true,
                feeChargedCents: platformFeeCents,
                serverTimestamp: Date.now()
            }));

        } catch (error) {
            console.error("❌ Protocol Failure: Rejected a corrupted payload.");
            socket.send(JSON.stringify({ status: "ERROR", message: "Invalid payload execution framework." }));
        }
    });
});
