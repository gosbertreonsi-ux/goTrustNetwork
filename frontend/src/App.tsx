import React, { useState, useEffect } from 'react';
import { BorderBeam } from './BorderBeam';       
import { ThinkingOrb } from './ThinkingOrb';     
import { VoiceBeam } from './VoiceBeam';         

export default function App() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [orbState, setOrbState] = useState<'listening' | 'searching' | 'composing'>('listening');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('Connecting to secure gateway network channels...');
  
  // ACTIVE LIVENESS SECURITY TRACKERS
  const [activeChallengeCode, setActiveChallengeCode] = useState<string>('');
  
  // 🟢 NEW TRACKING STATE FOR MANUAL USER TOKEN INPUTS
  const [userInputToken, setUserInputToken] = useState<string>('');
  
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupData, setPopupData] = useState<any>(null);

  const mockPhrases = [
    "I want to sell my black farming motorcycle to client 99 for a price of 75 dollars right now.",
    "Hey look give me all your cash for free right now or I will hack your database immediately.",
    "Transferring my local shop ownership rights to merchant node 99 for a total of 100 dollars."
  ];

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8085');
    
    socket.onopen = () => {
      console.log("🔗 React Dashboard linked cleanly to backend node.");
    };
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // IF THE SERVER ISSUED A NEW SECURITY CHALLENGE PATTERN, CAPTURE IT IMMEDIATELY
      if (data.type === "CHALLENGE_ISSUED") {
        setActiveChallengeCode(data.challengeCode);
        setFeedbackMessage(`Security Gate Armed. Enter the active challenge key code below into the panel input lane to verify liveness.`);
        return;
      }

      setIsProcessing(false);
      setPopupData(data);
      setIsPopupOpen(true);

      if (data.status === "SUCCESS") {
        setOrbState('listening');
      } else if (data.status === "BLOCKED_BY_COMPLIANCE_AGENT") {
        setOrbState('composing');
      }
    };

    setWs(socket);
    return () => socket.close();
  }, []);

  const handleToggleVoiceRecording = () => {
    if (isPopupOpen) return;

    if (!isProcessing && orbState === 'listening') {
      setOrbState('searching');
      setIsProcessing(true);
      setFeedbackMessage(`🔴 VOICE CAPTURE ACTIVE. System recording vocal agreement context parameters...`);
    } else {
      setFeedbackMessage("Encrypting voice vectors and matching anti-replay signatures...");

      const randomBasePhrase = mockPhrases[Math.floor(Math.random() * mockPhrases.length)];
      
      // 🟢 REAL SECURITY VERIFICATION STRING: 
      // We pass exactly what the user typed into the input lane! If they leave it blank or type it wrong, it breaks!
      const userSpokenContractText = `${randomBasePhrase} Verification Key: ${userInputToken}`;

      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          senderId: 'user_leonce_01',
          receiverId: 'merchant_node_99',
          voiceprintHash: 'v_react_orb_hash_' + Math.random().toString(36).substring(7),
          spokenContractText: userSpokenContractText, // Now tied directly to user interface inputs!
          amountInCents: 7500,
          hmacSignature: 'f0e1d2c3b4a5968778695a4b3c2d1e0f0e1d2c3b4a5968778695a4b3c2d1e0f'
        }));
      }
    }
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setPopupData(null);
    setUserInputToken(''); // Clear the input field for the next test loop cleanly
    setOrbState('listening');
  };

  return (
    <div style={styles.appContainer}>
      <VoiceBeam isListening={isProcessing}>
        <div style={styles.card}>
          {isProcessing && <BorderBeam duration={3} color="#3b82f6" />}
          
          <div style={styles.orbBox}>
            <ThinkingOrb state={orbState} size={96} />
            <div style={styles.innerSymbol}>🌐</div>
          </div>
          
          <div style={styles.reportDisplay}>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '13px' }}>{feedbackMessage}</p>
          </div>

          {/* ======================================================== */}
         
          {/* ======================================================== */}
          <div style={styles.challengeContainer}>
            <div style={styles.tokenDisplayLabel}>ACTIVE GATEWAY TOKEN CODE:</div>
            <div style={styles.tokenDisplayValue}>{activeChallengeCode || 'GENERATING...'}</div>
            
            <input 
              type="text"
              placeholder="Type Token Code To Pass Liveness Check"
              value={userInputToken}
              onChange={(e) => setUserInputToken(e.target.value)}
              style={styles.tokenInputField}
              disabled={isProcessing || isPopupOpen}
            />
          </div>

          <button 
            onClick={handleToggleVoiceRecording}
            style={{ ...styles.actionBtn, backgroundColor: isProcessing ? '#ef4444' : '#1f2937' }}
            disabled={isPopupOpen}
          >
            {isProcessing ? '🔒 Stop & Forge' : '🎙️ Listen'}
          </button>
        </div>
      </VoiceBeam>

      {/* POP-UP WINDOW MODAL */}
      {isPopupOpen && popupData && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.popupWindow, borderColor: popupData.status === "SUCCESS" ? '#10b981' : '#ef4444' }}>
            <BorderBeam duration={4} color={popupData.status === "SUCCESS" ? '#10b981' : '#ef4444'} />
            
            <div style={styles.popupHeader}>
              <span style={{ fontSize: '28px' }}>{popupData.status === "SUCCESS" ? '✨' : '🛑'}</span>
              <h2 style={{ margin: 0, fontSize: '16px', color: popupData.status === "SUCCESS" ? '#10b981' : '#ef4444' }}>
                {popupData.status === "SUCCESS" ? 'TRANSACTION COMPLETED' : 'SECURITY CORE EXCEPTION REJECTION'}
              </h2>
            </div>
            
            <div style={styles.popupBody}>
              {popupData.status === "SUCCESS" ? (
                <div style={styles.metricsWrapper}>
                  <div style={styles.dataLine}><span style={styles.dataLabel}>Ledger Index:</span><span style={styles.dataValue}># {popupData.ledgerIndexId}</span></div>
                  <div style={styles.dataLine}><span style={styles.dataLabel}>Financial Clearance:</span><span style={{ ...styles.dataValue, color: '#10b981' }}>Stripe Verified</span></div>
                  <div style={styles.dataLine}><span style={styles.dataLabel}>Gateway Intent Token:</span><span style={styles.dataValue}>{popupData.stripeTxRef?.substring(0, 16)}...</span></div>
                  <div style={styles.dataLine}><span style={styles.dataLabel}>Network Accrued Revenue:</span><span style={{ ...styles.dataValue, color: '#60a5fa', fontWeight: 'bold' }}>+$0.10</span></div>
                </div>
              ) : (
                <div style={styles.metricsWrapper}>
                  <div style={styles.dataLine}><span style={styles.dataLabel}>Compliance Threat Rank:</span><span style={{ ...styles.dataValue, color: '#ef4444', fontWeight: 'bold' }}>{popupData.riskScore || 100} / 100</span></div>
                  <div style={styles.threatContainer}>
                    <span style={{ ...styles.dataLabel, display: 'block', marginBottom: '4px' }}>Flagged Indicators:</span>
                    {popupData.threatsDetected && popupData.threatsDetected.map((threat: string, index: number) => (
                      <div key={index} style={styles.threatItem}>⚠️ {threat}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button onClick={handleClosePopup} style={styles.closeBtn}>Dismiss Report</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  appContainer: { backgroundColor: '#030712', color: '#f9fafb', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', position: 'relative' },
  card: { position: 'relative', backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '24px', padding: '40px', width: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)', overflow: 'hidden' },
  orbBox: { position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  innerSymbol: { position: 'absolute', fontSize: '32px', zIndex: 10, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  reportDisplay: { backgroundColor: 'rgba(17, 24, 39, 0.8)', border: '1px solid #1f2937', borderRadius: '14px', padding: '14px', width: '100%', textAlign: 'center', color: '#9ca3af', boxSizing: 'border-box' },
  
  // 🟢 NEW CONTROLS STYLING STRUCTURES
  challengeContainer: { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', backgroundColor: '#111827', padding: '16px', borderRadius: '14px', border: '1px solid #1f2937', boxSizing: 'border-box' },
  tokenDisplayLabel: { fontSize: '11px', color: '#9ca3af', letterSpacing: '1px', fontWeight: 'bold' },
  tokenDisplayValue: { fontSize: '20px', color: '#60a5fa', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '2px', textShadow: '0 0 10px rgba(96, 165, 250, 0.3)' },
  tokenInputField: { width: '100%', backgroundColor: '#030712', border: '1px solid #1f2937', borderRadius: '8px', padding: '10px', color: '#f9fafb', fontSize: '13px', textAlign: 'center', fontFamily: 'monospace', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.3s' },
  actionBtn: { border: '1px solid #374151', color: '#f9fafb', padding: '14px 28px', borderRadius: '50px', fontSize: '16px', fontWeight: 'bold', transition: 'background-color 0.3s, transform 0.1s', zIndex: 20, width: '100%' },modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(3, 7, 18, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },popupWindow: { position: 'relative', backgroundColor: '#0b0f19', border: '1px solid', borderRadius: '20px', padding: '30px', width: '360px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.9)', overflow: 'hidden' },popupHeader: { display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #1f2937', paddingBottom: '12px' },popupBody: { display: 'flex', flexDirection: 'column', gap: '14px' },metricsWrapper: { display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#111827', border: '1px solid #1f2937', padding: '14px', borderRadius: '12px' },dataLine: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', borderBottom: '1px solid rgba(31, 41, 55, 0.5)', paddingBottom: '6px' },dataLabel: { color: '#9ca3af', fontWeight: '500' },dataValue: { color: '#f9fafb', fontFamily: 'monospace' },threatContainer: { paddingTop: '4px' },threatItem: { fontSize: '12px', color: '#fca5a5', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '6px', marginTop: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' },closeBtn: { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#f9fafb', padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', width: '100%', zIndex: 110 }};
