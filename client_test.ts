import WebSocket from 'ws';
import * as crypto from 'crypto';

const NETWORK_SECRET = 'leonce_1000_year_secure_vault_key';
// Connecting explicitly to our open server port 8085 gateway
const ws = new WebSocket('ws://localhost:8085');

ws.on('open', () => {
    console.log('🔗 [Secure Link Open] Sending a legitimate, valid transaction payload...');

    const senderId = 'user_leonce_01';
    const receiverId = 'merchant_node_99';
    const voiceprintHash = 'v_hash_7a8b9c_biometric_voice_signature_verified';
    const amountInCents = 7500; // \$75.00

    // Strict formatting block string matching the server verification equation layout exactly
    const messageData = `${senderId}:${receiverId}:${voiceprintHash}:${amountInCents}`;
    
    const hmacSignature = crypto
        .createHmac('sha256', NETWORK_SECRET)
        .update(messageData)
        .digest('hex');

    const validTransaction = {
        senderId,
        receiverId,
        voiceprintHash,
        amountInCents,
        hmacSignature // Secure matching cryptographic payload verification seal
    };

    ws.send(JSON.stringify(validTransaction));
});

ws.on('message', (data: string) => {
    console.log('\n📥 [Network Response from goTrust]:', JSON.stringify(JSON.parse(data), null, 2));
    ws.close();
});

ws.on('close', () => {
    console.log('🔌 Link pipeline closed smoothly.');
});
