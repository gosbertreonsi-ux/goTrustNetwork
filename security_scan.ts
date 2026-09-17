import * as fs from 'fs';
import * as path from 'path';

console.log("🛡️  [goTrust Cybersecurity Integrity Scanner Starting]");
console.log("🔍 Evaluating application files for insecure patterns...\n");

const TARGET_FILES = ['server.ts', 'client_test.ts', 'analytics.ts', '.env'];
let securityAlertsCount = 0;

function scanFileForThreats(filePath: string) {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
        return;
    }

    const fileContent = fs.readFileSync(fullPath, 'utf8');

    // Rule 1: Check if the private network key or passwords are hardcoded inside standard code files
    if (filePath !== '.env' && fileContent.includes('1971')) {
        console.error(`🚨 [CRITICAL ALERT] Found hardcoded database password signature inside: ${filePath}`);
        securityAlertsCount++;
    }

    // Rule 2: Check if someone downgraded the protocol connection channels from secure WSS to raw WS in production
    if (filePath === 'server.ts' && fileContent.includes('ws://') && !fileContent.includes('localhost')) {
        console.warn(`⚠️ [WARNING] Production server using insecure websocket route structure (ws:// instead of wss://).`);
        securityAlertsCount++;
    }

    // Rule 3: Scan for unsafe dynamic evaluation blocks which enable remote execution injection hacks
    if (fileContent.includes('eval(')) {
        console.error(`🚨 [CRITICAL ALERT] Dangerous 'eval()' statement detected inside: ${filePath}`);
        securityAlertsCount++;
    }
}

TARGET_FILES.forEach(scanFileForThreats);

console.log("==================================================");
if (securityAlertsCount === 0) {
    console.log("✅ SYSTEM INTEGRITY SECURE: No hardcoded secrets or exploit injection signatures found.");
} else {
    console.error(`🛑 SCAN FAILED: Found ${securityAlertsCount} security threat(s). Clean your code lines immediately.`);
}
console.log("==================================================");
