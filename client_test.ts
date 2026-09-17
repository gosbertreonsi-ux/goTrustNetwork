import WebSocket from 'ws';
import * as crypto from 'crypto';

const NETWORK_SECRET = 'leonce_1000_year_secure_vault_key';
const ws = new WebSocket('ws://localhost:8085');

ws.on('open', () => {
    console.log('🔗 [Secure Link Open] Injecting live asset payload string into Autonomous AI Gateway...');

    const senderId = 'user_leonce_01';
    const receiverId = 'merchant_node_99';
    const voiceprintHash = 'v_hash_7a8b9c_biometric_voice_signature_verified';
    
    // 💡 Simulated clear speech agreement coming from an illiterate user
    const spokenContractText = "I am officially buying this motor vehicle from dealer 99 for a price of 75 dollars right now.";
    const amountInCents = 7500; 

    const messageData = `${senderId}:${receiverId}:${voiceprintHash}:${amountInCents}`;
    
    const hmacSignature = crypto
        .createHmac('sha256', NETWORK_SECRET)
        .update(messageData)
        .digest('hex');

    const autonomousTransaction = {
        senderId,
        receiverId,
        voiceprintHash,
        spokenContractText, // Embedded voice data string layout parameter
        amountInCents,
        hmacSignature 
    };

    ws.send(JSON.stringify(autonomousTransaction));
});

ws.on('message', (data: string) => {
    console.log('\n📥 [Gateway Engine Response Feedback]:', JSON.stringify(JSON.parse(data), null, 2));
    ws.close();
});
