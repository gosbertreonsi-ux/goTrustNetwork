import WebSocket from 'ws';
import * as crypto from 'crypto';

const NETWORK_SECRET = 'leonce_1000_year_secure_vault_key';
const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
    console.log('🔗 [Secure Link Open] Sending a legitimate, valid transaction payload...');

    const senderId = 'user_leonce_01';
    const receiverId = 'merchant_node_99';
    const voiceprintHash = 'v_hash_7a8b9c_biometric_voice_signature_verified';
    
    // Healthy transaction for \$75.00
    const amountInCents = 7500;
    const messageData = `${senderId}:${receiverId}:${voiceprintHash}:${amountInCents}`;
    
    // Generate a matching, valid signature for the \$75.00 price tag
    const hmacSignature = crypto
        .createHmac('sha256', NETWORK_SECRET)
        .update(messageData)
        .digest('hex');

    const validTransaction = {
        senderId,
        receiverId,
        voiceprintHash,
        amountInCents,
        hmacSignature // 100% correct signature seal
    };

    ws.send(JSON.stringify(validTransaction));
});

ws.on('message', (data: string) => {
    console.log('\n📥 [Network Response from goTrust]:', JSON.stringify(JSON.parse(data), null, 2));
    ws.close();
});
