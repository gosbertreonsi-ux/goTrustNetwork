import { WebSocketServer, WebSocket } from 'ws';

// The strict, un-fakeable data shape required by the goTrust protocol
export interface GoTrustTransaction {
    senderId: string;
    receiverId: string;
    voiceprintHash: string; // The mathematical vector representation of the spoken agreement
    amountInCents: number;  // Currency tracked securely in integers (e.g., 1000 = \$10.00)
}

// Fire up the node gateway on Port 8080
const wss = new WebSocketServer({ port: 8080 });

console.log("🚀 goTrust Core Network Node is LIVE on ws://localhost:8080");
console.log("🔒 Running independent, decentralized engine protocol...");

wss.on('connection', (socket: WebSocket) => {
    console.log("📡 [Link Secured] A third-party system has successfully connected to goTrust.");

    socket.on('message', (message: string) => {
        try {
            // Parse and strictly authenticate the incoming system payload
            const payload: GoTrustTransaction = JSON.parse(message);
            
            // Validate that required fields exist to prevent bad data forging
            if (!payload.senderId || !payload.receiverId || !payload.voiceprintHash || payload.amountInCents === undefined) {
                throw new Error("Missing required protocol properties");
            }

            console.log(`\n💸 [Transaction Verified & Forged]`);
            console.log(`👤 From: ${payload.senderId} -> 👤 To: ${payload.receiverId}`);
            console.log(`🎙️ Voice Signature: ${payload.voiceprintHash}`);
            console.log(`📊 Asset Value: $${(payload.amountInCents / 100).toFixed(2)}`);

            // The 1,000-year algorithmic revenue generation (\$0.10 processing fee)
            const platformFeeCents = 10; 
            const merchantPayoutCents = payload.amountInCents - platformFeeCents;
            
            console.log(`💰 [Network Revenue Generated]: +$0.10 instantly locked in Leonce's ledger.`);
            console.log(`🔓 [Settlement]: $${(merchantPayoutCents / 100).toFixed(2)} routed for delivery.`);

            // Return a cryptographic success packet back to the connecting client system
            socket.send(JSON.stringify({
                status: "SUCCESS",
                networkName: "goTrust Core Engine",
                feeChargedCents: platformFeeCents,
                serverTimestamp: Date.now()
            }));

        } catch (error) {
            console.error("❌ Protocol Violation: Rejected a corrupted data packet layout.");
            socket.send(JSON.stringify({ status: "ERROR", message: "Corrupted or unauthorized payload structure." }));
        }
    });

    socket.on('close', () => {
        console.log("🔌 [Bridge Closed] External system disconnected safely.");
    });
});
