import WebSocket from 'ws';

// Establish a raw connection to your running goTrust network node
const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
    console.log('🔗 [Connection Established] Third-party app linked to goTrust.');

    // Simulating an illiterate user executing a voice contract
    // The voiceprintHash represents a 512-bit mathematical vector generated from their voice
    const mockTransaction = {
        senderId: 'user_leonce_01',
        receiverId: 'merchant_node_99',
        voiceprintHash: 'v_hash_7a8b9c_biometric_voice_signature_verified',
        amountInCents: 7500 // Represents \$75.00
    };

    console.log('📤 Sending transaction payload into the goTrust ledger...');
    ws.send(JSON.stringify(mockTransaction));
});

ws.on('message', (data: string) => {
    const response = JSON.parse(data);
    console.log('\n📥 [Network Response Received From goTrust Node]:');
    console.log(JSON.stringify(response, null, 2));
    
    // Disconnect cleanly once the transaction processing fee is confirmed
    ws.close();
});

ws.on('close', () => {
    console.log('🔌 Disconnected from the core protocol network stream.');
});
