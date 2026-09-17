import { describe, it, expect } from 'vitest';
import * as crypto from 'crypto';

const NETWORK_SECRET = 'leonce_1000_year_secure_vault_key';

// The system function that re-creates and evaluates cryptographic signatures
function verifyIncomingSignature(senderId: string, receiverId: string, voiceprintHash: string, amountInCents: number, incomingSignature: string): boolean {
    const messageData = `${senderId}:${receiverId}:${voiceprintHash}:${amountInCents}`;
    const expectedSignature = crypto
        .createHmac('sha256', NETWORK_SECRET)
        .update(messageData)
        .digest('hex');
    
    return incomingSignature === expectedSignature;
}

describe('🔒 goTrust Cryptographic Core Protocol Engine Security Tests', () => {

    it('🟢 SUCCESS: Should approve an un-tampered payload with matching signature seal', () => {
        const senderId = 'user_leonce_01';
        const receiverId = 'merchant_node_99';
        const voiceprintHash = 'v_hash_7a8b9c_biometric_voice_signature_verified';
        const amountInCents = 7500;

        const messageData = `${senderId}:${receiverId}:${voiceprintHash}:${amountInCents}`;
        const validSignature = crypto
            .createHmac('sha256', NETWORK_SECRET)
            .update(messageData)
            .digest('hex');

        const result = verifyIncomingSignature(senderId, receiverId, voiceprintHash, amountInCents, validSignature);
        
        // Assert that our engine securely approves the transaction layout block
        expect(result).toBe(true);
    });

    it('🛑 REJECTED: Should detect altered amounts and catch a malicious hacker signature violation', () => {
        const senderId = 'user_leonce_01';
        const receiverId = 'merchant_node_99';
        const voiceprintHash = 'v_hash_7a8b9c_biometric_voice_signature_verified';
        
        // Signed price tag is \$75.00
        const messageData = `${senderId}:${receiverId}:${voiceprintHash}:7500`;
        const validSignature = crypto
            .createHmac('sha256', NETWORK_SECRET)
            .update(messageData)
            .digest('hex');

        // Hacker tries to change the price payload parameter to \$999.99 in transit
        const hackedAmount = 99999;

        const result = verifyIncomingSignature(senderId, receiverId, voiceprintHash, hackedAmount, validSignature);
        
        // Assert that our validation filters catch this fraud modification and return false
        expect(result).toBe(false);
    });
});
