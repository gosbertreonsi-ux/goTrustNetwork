import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:8080');

console.log("🖥️  [goTrust Real-Time Streaming Dashboard Module initialized]");
console.log("📡 Hooking into network event pipeline on Port 8080...");

ws.on('open', () => {
    // Notify the node server that we are connecting purely as a passive stream listener
    ws.send(JSON.stringify({ type: 'MONITOR_SUBSCRIBE' }));
    console.log("🟢 Connected! Standing by for live network transaction alerts...\n");
});

ws.on('message', (rawEvent: string) => {
    const event = JSON.parse(rawEvent);
    
    // Catch the real-time broadcast streams coming from the core server engine node
    if (event.type === 'LIVE_LEDGER_ALERT') {
        console.log("⚡==================================================⚡");
        console.log(`🚨 [LIVE TRANS ACTION RECORDED IN LEDGER ROW: #${event.ledgerIndexId}]`);
        console.log(`👤 From User : ${event.sender}`);
        console.log(`👤 To User   : ${event.receiver}`);
        console.log(`💰 Volume    : $${event.valueProcessed}`);
        console.log(`💵 Your Fee  : +$${event.revenueLocked} instantly accrued!`);
        console.log(`⏰ Time      : ${new Date(event.timestamp).toLocaleTimeString()}`);
        console.log("⚡==================================================⚡\n");
    }
});

ws.on('close', () => {
    console.log("❌ Core server severed the link pipeline connection.");
});
