import WebSocket from 'ws';
import * as crypto from 'crypto';

const NETWORK_SECRET = 'leonce_1000_year_secure_vault_key';
const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
    console.log('🔗 [Secure Link Open] Sending altered transaction data...');

    const senderId = 'user_leonce_01';
    const receiverId = 'merchant_node_99';
    const voiceprintHash = 'v_hash_7a8b9c_biometric_voice_signature_verified';
    
    // 1. We sign a transaction for 7500 (\$75.00)
    const originalAmount = 7500;
    const messageData = `${senderId}:${receiverId}:${voiceprintHash}:${originalAmount}`;
    
    const realHmacSignature = crypto
        .createHmac('sha256', NETWORK_SECRET)
        .update(messageData)
        .digest('hex');

    // 2. TAMPERING STEP: We package the data, but swap out the price to 99999 (\$999.99)
    // The signature attached is for the \$75 price, NOT the \$999 price!
    const hackedTransaction = {
        senderId,
        receiverId,
        voiceprintHash,
        amountInCents: 99999, // Altered amount!
        hmacSignature: realHmacSignature // Broken signature for this specific amount
    };

    ws.send(JSON.stringify(hackedTransaction));
});

ws.on('message', (data: string) => {
    console.log('\n📥 [Network Response]:', JSON.stringify(JSON.parse(data), null, 2));
    ws.close();
});
