import React, { useState, useMemo } from 'react';
import { Lock, Unlock, Key, Calculator, FileText, ArrowRight, ArrowDown, Activity, Cpu } from 'lucide-react';
import './RSAVisualizer.css';

// --- RSA MATHEMATICS & HELPER ALGORITHMS (Using BigInt for precision) ---

// Small prime list for visualizable mathematics (Product p*q must be > 127 for ASCII text)
const PRIMES = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];

// Greatest Common Divisor
const gcd = (a, b) => (b === 0n ? a : gcd(b, a % b));

// Modular Multiplicative Inverse using Extended Euclidean Algorithm
const modInverse = (a, m) => {
  let m0 = m;
  let y = 0n, x = 1n;
  if (m === 1n) return 0n;
  while (a > 1n) {
    let q = a / m;
    let t = m;
    m = a % m;
    a = t;
    t = y;
    y = x - q * y;
    x = t;
  }
  if (x < 0n) x += m0;
  return x;
};

// Modular Exponentiation: (base^exp) % mod
const modPow = (base, exp, mod) => {
  let res = 1n;
  base = base % mod;
  while (exp > 0n) {
    if (exp % 2n === 1n) res = (res * base) % mod;
    exp = exp / 2n;
    base = (base * base) % mod;
  }
  return res;
};

// --- MAIN COMPONENT ---

export default function RSAVisualizer() {
  // Configuration State
  const [pIdx, setPIdx] = useState(0); // 11
  const [qIdx, setQIdx] = useState(2); // 17
  const [eSelectionIndex, setESelectionIndex] = useState(0);
  
  // Data State
  const [plaintext, setPlaintext] = useState('RSA');
  const [selectedCharIdx, setSelectedCharIdx] = useState(0);

  // Core Math & Key Generation
  const p = BigInt(PRIMES[pIdx]);
  const q = BigInt(PRIMES[qIdx]);
  
  const n = useMemo(() => p * q, [p, q]);
  const phi = useMemo(() => (p - 1n) * (q - 1n), [p, q]);
  
  // Find valid Public Exponents (e) where 1 < e < phi and gcd(e, phi) == 1
  const eCandidates = useMemo(() => {
    let cands = [];
    for (let i = 3n; i < phi; i += 2n) {
      if (gcd(i, phi) === 1n) {
        cands.push(i);
        if (cands.length >= 6) break; // Limit dropdown choices for UI simplicity
      }
    }
    return cands;
  }, [phi]);

  // Fallback to first valid e if selection is out of bounds due to changing p/q
  const currentEIdx = eSelectionIndex < eCandidates.length ? eSelectionIndex : 0;
  const e = eCandidates[currentEIdx] || 3n; 

  // Calculate Private Exponent (d)
  const d = useMemo(() => modInverse(e, phi), [e, phi]);

  // Strip non-ASCII characters to keep math within the (N > 127) bound
  const cleanPlaintext = plaintext.replace(/[^\x00-\x7F]/g, '').substring(0, 12);

  // Compute the encryption trace
  const encryptionTrace = useMemo(() => {
    return cleanPlaintext.split('').map((char) => {
      const m = BigInt(char.charCodeAt(0));
      const c = modPow(m, e, n);
      const dec = modPow(c, d, n);
      return {
        char,
        m: m.toString(),
        c: c.toString(),
        dec: String.fromCharCode(Number(dec))
      };
    });
  }, [cleanPlaintext, e, d, n]);

  const activeStep = encryptionTrace[selectedCharIdx] || null;

  return (
    <div className="rsa-wrapper">
      <div className="rsa-container">
        
        {/* Header */}
        <header className="rsa-header">
          <div className="rsa-header-left">
            <div className="rsa-icon-box">
              <Key className="w-7 h-7" />
            </div>
            <div>
              <h1 className="rsa-title">RSA Cryptography Visualizer</h1>
              <p className="rsa-subtitle">Interactive Asymmetric Key Generation & Encryption</p>
            </div>
          </div>
        </header>

        <div className="rsa-grid">
          
          {/* Left Column: Key Generation Station */}
          <div className="rsa-left-col">
            
            <div className="rsa-card">
              <h2 className="rsa-card-title">
                <Cpu className="w-4 h-4" style={{ color: 'var(--info-main)' }} /> Key Generation Math
              </h2>
              
              <div>
                {/* 1. Prime Selection */}
                <div className="rsa-math-step">
                  <div className="rsa-step-header">
                    <span className="rsa-step-title">1. Choose Primes</span>
                    <span className="rsa-step-desc">P × Q must be &gt; 127</span>
                  </div>
                  <div className="rsa-prime-grid">
                    <div className="rsa-input-group">
                      <label className="rsa-label">Prime 1 (P)</label>
                      <select 
                        value={pIdx} 
                        onChange={(ev) => setPIdx(Number(ev.target.value))}
                        className="rsa-select"
                      >
                        {PRIMES.map((prime, idx) => <option key={`p-${prime}`} value={idx}>{prime}</option>)}
                      </select>
                    </div>
                    <div className="rsa-input-group">
                      <label className="rsa-label">Prime 2 (Q)</label>
                      <select 
                        value={qIdx} 
                        onChange={(ev) => setQIdx(Number(ev.target.value))}
                        className="rsa-select"
                      >
                        {PRIMES.map((prime, idx) => (
                          <option key={`q-${prime}`} value={idx} disabled={idx === pIdx}>
                            {prime} {idx === pIdx ? '(Used)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Modulus & Totient */}
                <div className="rsa-math-step">
                  <div className="rsa-step-title" style={{ marginBottom: '0.25rem' }}>2. Calculate Modulus & Totient</div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div className="rsa-equation-row">
                      <span className="rsa-equation-left">N = p × q</span>
                      <span className="rsa-equation-right">{p.toString()} × {q.toString()} = <span className="rsa-equation-highlight-n">{n.toString()}</span></span>
                    </div>
                    <div className="rsa-equation-row">
                      <span className="rsa-equation-left">φ(N) = (p-1)(q-1)</span>
                      <span className="rsa-equation-right">{((p-1n).toString())} × {((q-1n).toString())} = <span className="rsa-equation-highlight-phi">{phi.toString()}</span></span>
                    </div>
                  </div>
                </div>

                {/* 3. Exponents */}
                <div className="rsa-math-step">
                  <div className="rsa-step-title" style={{ marginBottom: '0.25rem' }}>3. Derive Exponents</div>
                  
                  <div className="rsa-exponent-group">
                    <div>
                      <div className="rsa-pub-exp-header">
                        <label className="rsa-pub-exp-label">Public Exponent (E)</label>
                        <span className="rsa-step-desc">1 &lt; E &lt; φ(N), coprime to φ(N)</span>
                      </div>
                      <select 
                        value={currentEIdx} 
                        onChange={(ev) => setESelectionIndex(Number(ev.target.value))}
                        className="rsa-pub-exp-select"
                      >
                        {eCandidates.map((cand, idx) => (
                          <option key={cand.toString()} value={idx}>{cand.toString()}</option>
                        ))}
                      </select>
                    </div>

                    <div className="rsa-priv-exp-box">
                       <div className="rsa-priv-exp-label-group">
                         <span className="rsa-priv-exp-label">Private Exponent (D)</span>
                         <span className="rsa-priv-exp-formula">d ≡ e⁻¹ (mod φ(N))</span>
                       </div>
                       <span className="rsa-priv-exp-value">{d.toString()}</span>
                    </div>
                  </div>
                </div>

                {/* Final Keys Display */}
                <div className="rsa-keys-grid">
                   <div className="rsa-key-box public">
                      <Lock className="rsa-key-icon" />
                      <span className="rsa-key-label">Public Key (E, N)</span>
                      <span className="rsa-key-value">({e.toString()}, {n.toString()})</span>
                   </div>
                   <div className="rsa-key-box private">
                      <Unlock className="rsa-key-icon" />
                      <span className="rsa-key-label">Private Key (D, N)</span>
                      <span className="rsa-key-value">({d.toString()}, {n.toString()})</span>
                   </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: Encrypt / Decrypt Visualization */}
          <div className="rsa-right-col">
            
            {/* Input Message */}
            <div className="rsa-card">
               <label className="rsa-input-label">
                 <FileText className="w-4 h-4 rsa-input-label-icon" /> Secret Message
               </label>
               <input 
                 type="text" 
                 value={plaintext}
                 maxLength={12}
                 onChange={(e) => {
                    setPlaintext(e.target.value);
                    setSelectedCharIdx(0);
                 }}
                 className="rsa-text-input"
                 placeholder="Type short message..."
               />
               <p className="rsa-input-hint">Max 12 ASCII characters for visualization.</p>
            </div>

            {/* Step-by-Step Visualization */}
            <div className="rsa-viz-card">
               
               <h2 className="rsa-trace-header">
                  <Activity className="w-4 h-4 rsa-trace-header-icon" /> Transformation Trace
               </h2>

               {encryptionTrace.length > 0 ? (
                 <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10 }}>
                   
                   {/* Character Block Selector */}
                   <div className="rsa-char-selector">
                     {encryptionTrace.map((step, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedCharIdx(idx)}
                          className={`rsa-char-btn ${selectedCharIdx === idx ? 'active' : ''}`}
                        >
                          <span className="rsa-char-btn-text">{step.char}</span>
                          <span className="rsa-char-btn-c">C: {step.c}</span>
                        </button>
                     ))}
                   </div>

                   {/* Deep Dive Math Stage */}
                   {activeStep && (
                     <div className="rsa-math-stage">
                        
                        <Calculator className="rsa-math-bg-icon" />

                        <div className="rsa-math-grid">
                           
                           {/* Encryption Side */}
                           <div className="rsa-phase-col">
                              <div className="rsa-phase-badge enc">
                                Phase 1: Encryption
                              </div>
                              
                              <div className="rsa-math-steps-col">
                                 <div className="rsa-calc-box">
                                    <div className="rsa-calc-label">1. Convert to Number (M)</div>
                                    <div className="rsa-calc-eq">
                                      ASCII('<span className="rsa-char-highlight">{activeStep.char}</span>') = <span className="rsa-m-highlight">{activeStep.m}</span>
                                    </div>
                                 </div>

                                 <div className="rsa-calc-arrow">
                                   <ArrowDown className="w-4 h-4" />
                                 </div>

                                 <div className="rsa-calc-box highlight-enc">
                                    <div className="rsa-calc-label">
                                      <span className="rsa-calc-label-highlight enc">2. Apply Public Key (E, N)</span>
                                      <span className="rsa-calc-formula">C = M^E (mod N)</span>
                                    </div>
                                    <div className="rsa-calc-eq">
                                      {activeStep.m}<sup className="enc">{e.toString()}</sup> mod {n.toString()}
                                    </div>
                                    <div className="rsa-calc-result enc">
                                      = {activeStep.c}
                                    </div>
                                 </div>
                              </div>
                           </div>

                           {/* Decryption Side */}
                           <div className="rsa-phase-col">
                              <div className="rsa-phase-badge dec">
                                Phase 2: Decryption
                              </div>
                              
                              <div className="rsa-math-steps-col">
                                 <div className="rsa-calc-box highlight-dec">
                                    <div className="rsa-calc-label">
                                      <span className="rsa-calc-label-highlight dec">3. Apply Private Key (D, N)</span>
                                      <span className="rsa-calc-formula">M = C^D (mod N)</span>
                                    </div>
                                    <div className="rsa-calc-eq">
                                      {activeStep.c}<sup className="dec">{d.toString()}</sup> mod {n.toString()}
                                    </div>
                                    <div className="rsa-calc-result dec">
                                      = {activeStep.m}
                                    </div>
                                 </div>

                                 <div className="rsa-calc-arrow">
                                   <ArrowDown className="w-4 h-4" />
                                 </div>

                                 <div className="rsa-calc-box">
                                    <div className="rsa-calc-label">4. Revert to Text</div>
                                    <div className="rsa-calc-eq">
                                      char({activeStep.m}) = '<span className="rsa-m-highlight">{activeStep.dec}</span>'
                                    </div>
                                 </div>
                              </div>
                           </div>
                           
                        </div>
                     </div>
                   )}
                 </div>
               ) : (
                 <div className="rsa-awaiting">
                   <FileText className="w-16 h-16" />
                   <h3>Awaiting Input</h3>
                   <p>
                     Enter a secret message above to visualize how RSA encrypts and decrypts each character using modular exponentiation.
                   </p>
                 </div>
               )}

            </div>

            {/* Ciphertext Output Belt */}
            <div className="rsa-cipher-belt">
               <span className="rsa-cipher-belt-label">Raw Ciphertext Array:</span>
               <div className="rsa-cipher-belt-array custom-scrollbar">
                  [ {encryptionTrace.map(t => t.c).join(', ')} ]
               </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
