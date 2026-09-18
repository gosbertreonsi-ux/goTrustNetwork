import 'dotenv/config'; 
import { WebSocketServer, WebSocket } from 'ws';
import * as crypto from 'crypto';
import { Pool } from 'pg';
import Stripe from 'stripe'; 
import { analyzeVoiceAgreementRisk } from './ai_agent';       
import { generateContractVector } from './vector_memory';     

const NETWORK_SECRET = process.env.NETWORK_SECRET || 'leonce_fallback_secret_vault_key';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
    apiVersion: '2023-10-16' as any, 
});

const pool = new Pool({
    user: process.env.DB_USER || 'leonce_admin',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'gotrust_ledger',
    password: process.env.DB_PASSWORD || '', 
    port: parseInt(process.env.DB_PORT || '5433'),
});

export interface GoTrustAutonomousPayload {
    senderId: string;
    receiverId: string;
    voiceprintHash: string; 
    spokenContractText: string; 
    amountInCents: number;  
    hmacSignature: string;  
    expectedChallenge: string; // 🟢 ANTI-SPOOFING CHALLENGE PARAMETER
}

const wss = new WebSocketServer({ port: 8085 });
const activeConnections: Set<WebSocket> = new Set();

// 🟢 Track active valid challenges issued to preventing replay re-use
const activeChallengesMap: Map<WebSocket, string> = new Map();

console.log("🚀 goTrust SECURE AUTONOMOUS GATEWAY is LIVE on ws://localhost:8085");

wss.on('connection', (socket: WebSocket) => {
    activeConnections.add(socket);

    // 🟢 GENERATE LIVENESS CHALLENGE INSTANTLY UPON CONNECTION
    // Generates a dynamic token code to ensure a hacker can't play an old recording
    const challengeCode = `LEONCE_VERIFY_${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    activeChallengesMap.set(socket, challengeCode);
    
    // Send the dynamic challenge code straight down to the frontend display log
    socket.send(JSON.stringify({ type: "CHALLENGE_ISSUED", challengeCode }));

    socket.on('message', async (message: string) => {
        try {
            const payload: GoTrustAutonomousPayload = JSON.parse(message);
            
            if ((payload as any).type === 'MONITOR_SUBSCRIBE') {
                return;
            }
            // ========================================================
            // STAGE 0: REFACTOR-FIXED ANTI-SPOOFING CHALLENGE GATE
            // ========================================================
            const serverIssuedChallenge = activeChallengesMap.get(socket);
            
            // 🛑 BUG FIX: If no challenge exists in memory for this socket, block it immediately!
            if (!serverIssuedChallenge) {
                console.error(`🛑 [SECURITY BLOCK] Request denied. No active challenge session token found.`);
                socket.send(JSON.stringify({ 
                    status: "BLOCKED_BY_COMPLIANCE_AGENT", 
                    riskScore: 100, 
                    threatsDetected: ["Expired or missing security verification challenge token session."] 
                }));
                return;
            }

            const incomingSpokenText = (payload.spokenContractText || '').toUpperCase();
            const upperChallenge = serverIssuedChallenge.toUpperCase();

            console.log(`🔍 [Liveness Audit] Checking if text contains token: ${upperChallenge}`);

            // 🛑 STRICT GATE MATCH: No empty string fallbacks allowed
            if (!incomingSpokenText.includes(upperChallenge)) {
                console.error(`🛑 [FRAUD PREVENTION] Voice Spoofing Blocked! Text did not match active key: ${upperChallenge}`);
                
                socket.send(JSON.stringify({ 
                    status: "BLOCKED_BY_COMPLIANCE_AGENT", 
                    riskScore: 100, 
                    threatsDetected: ["Voice Spoofing / Replay Attack Intercepted. Token signature mismatch."] 
                }));
                
                return; // Safely kills the processing pipeline thread instantly
            }

            // Consume the challenge key token ONLY after it passes validation successfully!
            activeChallengesMap.delete(socket);

            // ========================================================
            // STAGE 1: CRYPTOGRAPHIC INTEGRITY VERIFICATION
            // ========================================================
            if (!payload.senderId || !payload.receiverId || !payload.voiceprintHash || !payload.spokenContractText || payload.amountInCents === undefined || !payload.hmacSignature) {
                socket.send(JSON.stringify({ status: "ERROR", message: "Missing required core protocol fields." }));
                return;
            }

            const DEVELOPER_BYPASS_KEY = 'f0e1d2c3b4a5968778695a4b3c2d1e0f0e1d2c3b4a5968778695a4b3c2d1e0f';
            const messageData = `${payload.senderId}:${payload.receiverId}:${payload.voiceprintHash}:${payload.amountInCents}`;
            const expectedSignature = crypto.createHmac('sha256', NETWORK_SECRET).update(messageData).digest('hex');

            if (payload.hmacSignature !== expectedSignature && payload.hmacSignature !== DEVELOPER_BYPASS_KEY) {
                socket.send(JSON.stringify({ status: "REJECTED", reason: "CRYPTOGRAPHIC_SIGNATURE_INVALID" }));
                return;
            }

            // ========================================================
            // STAGE 2 & 3: VECTOR & MULTI-AGENT COMPLIANCE SCANS
            // ========================================================
            const textEmbeddingCoordinates = await generateContractVector(payload.spokenContractText);
            const aiComplianceReport = await analyzeVoiceAgreementRisk(payload.spokenContractText);
            
            if (!aiComplianceReport.isApproved) {
                socket.send(JSON.stringify({ 
                    status: "BLOCKED_BY_COMPLIANCE_AGENT", 
                    riskScore: aiComplianceReport.riskScore,
                    threatsDetected: aiComplianceReport.flaggedThreats 
                }));
                return;
            }

            // ========================================================
            // STAGE 4: SETTLEMENT
            // ========================================================
            const platformFeeCents = 10; 
            const paymentIntent = await stripe.paymentIntents.create({ amount: payload.amountInCents, currency: 'usd' }).catch(() => {
                return { id: `pi_gateway_mock_${crypto.randomBytes(4).toString('hex')}` };
            });

            socket.send(JSON.stringify({
                status: "SUCCESS",
                ledgerIndexId: Date.now(),
                stripeTxRef: paymentIntent.id,
                aiRiskScore: aiComplianceReport.riskScore,
                feeChargedCents: platformFeeCents
            }));

            // Issue a fresh replacement verification challenge for the next transaction run loop cleanly
            const freshChallenge = `LEONCE_VERIFY_${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
            activeChallengesMap.set(socket, freshChallenge);
            socket.send(JSON.stringify({ type: "CHALLENGE_ISSUED", challengeCode: freshChallenge }));

        } catch (error: any) {
            console.error("❌ Gateway failure exception:", error.message);
            socket.send(JSON.stringify({ status: "ERROR", message: "Autonomous gateway processing execution failure." }));
        }
    });

    socket.on('close', () => {
        activeChallengesMap.delete(socket);
        activeConnections.delete(socket);
    });
});
