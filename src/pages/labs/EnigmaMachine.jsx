import React, { useState, useMemo } from 'react';
import { Lock, ArrowRight, ArrowDown, ArrowUp, Zap, Settings, Keyboard, Lightbulb, Info } from 'lucide-react';
import './EnigmaMachine.css';

// --- ENIGMA MACHINE SPECIFICATIONS & ALGORITHMS ---

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Historical Enigma Rotor Wirings and Notches (1930s Wehrmacht/Kriegsmarine)
const ROTORS = {
  I:   { wiring: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', notch: 'Q' },
  II:  { wiring: 'AJDKSIRUXBLHWTMCQGZNPYFVOE', notch: 'E' },
  III: { wiring: 'BDFHJLCPRTXVZNYEIWGAKMUSQO', notch: 'V' },
  IV:  { wiring: 'ESOVPZJAYQUIRHXLNFTGKDCMWB', notch: 'J' },
  V:   { wiring: 'VZBRGITYUPSDNHLXAWMJQOFECK', notch: 'Z' }
};

const REFLECTORS = {
  B: 'YRUHQSLDPXNGOKMIEBFZCWVJAT',
  C: 'FVPJIAOYEDRZXWGCTKUQSBNMHL'
};

// Helper functions for character/index math
const c2i = (c) => c.charCodeAt(0) - 65;
const i2c = (i) => String.fromCharCode(((i % 26) + 26) % 26 + 65);

// Parses plugboard string (e.g., "AB CD") into a dictionary mapping
const parsePlugboard = (pbString) => {
  const mapping = {};
  const pairs = pbString.toUpperCase().replace(/[^A-Z\s]/g, '').trim().split(/\s+/);
  const seen = new Set();
  
  pairs.forEach(pair => {
    if (pair.length === 2 && pair[0] !== pair[1] && !seen.has(pair[0]) && !seen.has(pair[1])) {
      mapping[pair[0]] = pair[1];
      mapping[pair[1]] = pair[0];
      seen.add(pair[0]);
      seen.add(pair[1]);
    }
  });
  return mapping;
};

// Pass signal through Plugboard
const passPlugboard = (char, pbMap) => pbMap[char] || char;

// Pass signal Forward through a Rotor (Right to Left)
const passForward = (char, rotorDef, posChar) => {
  const pos = c2i(posChar);
  const inIdx = (c2i(char) + pos) % 26;
  const mappedChar = rotorDef.wiring[inIdx];
  const outIdx = (c2i(mappedChar) - pos + 26) % 26;
  return i2c(outIdx);
};

// Pass signal Backward through a Rotor (Left to Right)
const passReverse = (char, rotorDef, posChar) => {
  const pos = c2i(posChar);
  const inIdx = (c2i(char) + pos) % 26;
  const targetChar = i2c(inIdx);
  const mappedIdx = rotorDef.wiring.indexOf(targetChar);
  const outIdx = (mappedIdx - pos + 26) % 26;
  return i2c(outIdx);
};

// --- MAIN COMPONENT ---

export default function EnigmaMachine() {
  // Config State
  const [rotorSel, setRotorSel] = useState(['I', 'II', 'III']); // [Left, Middle, Right]
  const [initPos, setInitPos] = useState(['A', 'A', 'A']);
  const [reflector, setReflector] = useState('B');
  const [plugboard, setPlugboard] = useState('AB CD EF');
  
  // Data State
  const [plaintext, setPlaintext] = useState('HELLO ENIGMA');
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Compute the entire encryption trace using useMemo
  const encryptionTrace = useMemo(() => {
    const cleanedText = plaintext.toUpperCase().replace(/[^A-Z]/g, '');
    const pbMap = parsePlugboard(plugboard);
    const trace = [];
    
    // Initialize rotor positions
    let p1 = c2i(initPos[0]), p2 = c2i(initPos[1]), p3 = c2i(initPos[2]);
    const def1 = ROTORS[rotorSel[0]];
    const def2 = ROTORS[rotorSel[1]];
    const def3 = ROTORS[rotorSel[2]];
    const refDef = REFLECTORS[reflector];

    for (let i = 0; i < cleanedText.length; i++) {
      const char = cleanedText[i];
      
      // 1. Step Rotors (Enigma steps BEFORE encrypting the character)
      const n2 = c2i(def2.notch);
      const n3 = c2i(def3.notch);

      let step1 = false, step2 = false, step3 = true; // R3 (Right) always steps

      // Enigma Double-Stepping Anomaly
      if (p2 === n2) { step1 = true; step2 = true; } // Middle at notch: steps itself and Left
      if (p3 === n3) { step2 = true; } // Right at notch: steps Middle

      if (step1) p1 = (p1 + 1) % 26;
      if (step2) p2 = (p2 + 1) % 26;
      if (step3) p3 = (p3 + 1) % 26;

      const currentPos = [i2c(p1), i2c(p2), i2c(p3)];

      // 2. Encryption Path
      const pb1 = passPlugboard(char, pbMap);
      const r3_out = passForward(pb1, def3, currentPos[2]);
      const r2_out = passForward(r3_out, def2, currentPos[1]);
      const r1_out = passForward(r2_out, def1, currentPos[0]);
      
      const ref_out = refDef[c2i(r1_out)];
      
      const r1_rev = passReverse(ref_out, def1, currentPos[0]);
      const r2_rev = passReverse(r1_rev, def2, currentPos[1]);
      const r3_rev = passReverse(r2_rev, def3, currentPos[2]);
      
      const pb2 = passPlugboard(r3_rev, pbMap);
      
      trace.push({
        in: char,
        out: pb2,
        pos: currentPos,
        path: { pb1, r3_out, r2_out, r1_out, ref_out, r1_rev, r2_rev, r3_rev, pb2 }
      });
    }
    
    return trace;
  }, [plaintext, rotorSel, initPos, reflector, plugboard]);

  const ciphertext = encryptionTrace.map(t => t.out).join('');
  const activeStep = selectedIndex !== null ? encryptionTrace[selectedIndex] : null;

  const handleRotorChange = (index, val) => {
    const newRotors = [...rotorSel];
    newRotors[index] = val;
    setRotorSel(newRotors);
    setSelectedIndex(null);
  };

  const handlePosChange = (index, val) => {
    const newPos = [...initPos];
    newPos[index] = val.toUpperCase().replace(/[^A-Z]/g, '')[0] || 'A';
    setInitPos(newPos);
    setSelectedIndex(null);
  };

  const UPathRow = ({ label, leftIn, leftOut, rightIn, rightOut, showArrows = true, posL = null, posR = null }) => (
    <div className="enigma-upath-row">
      <div className="enigma-upath-side">
        <div className="enigma-upath-label-box">
          <div className="enigma-upath-label">{label}</div>
          {posL && <div className="enigma-upath-pos">Pos: {posL}</div>}
        </div>
        <div className="enigma-upath-flow">
          <span className="enigma-upath-char dim">{leftIn}</span>
          <ArrowRight className="w-3.5 h-3.5 enigma-upath-arrow" />
          <span className="enigma-upath-char highlight">{leftOut}</span>
        </div>
        {showArrows && <ArrowDown className="w-4 h-4 enigma-upath-connector-down" />}
      </div>
      
      <div className="enigma-upath-side">
        <div className="enigma-upath-flow">
          <span className="enigma-upath-char highlight">{rightIn}</span>
          <ArrowRight className="w-3.5 h-3.5 enigma-upath-arrow" />
          <span className="enigma-upath-char dim">{rightOut}</span>
        </div>
        <div className="enigma-upath-label-box" style={{ alignItems: 'flex-end' }}>
          <div className="enigma-upath-label">{label}</div>
          {posR && <div className="enigma-upath-pos">Pos: {posR}</div>}
        </div>
        {showArrows && <ArrowUp className="w-4 h-4 enigma-upath-connector-up" />}
      </div>
    </div>
  );

  return (
    <div className="enigma-wrapper">
      <div className="enigma-container">
        
        <header className="enigma-header">
          <div className="enigma-header-left">
            <div className="enigma-icon-box">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h1 className="enigma-title">
                Enigma Machine <span className="enigma-title-badge">M3</span>
              </h1>
              <p className="enigma-subtitle">Interactive cryptographic signal visualization</p>
            </div>
          </div>
          <a href="https://en.wikipedia.org/wiki/Enigma_machine" target="_blank" rel="noreferrer" className="enigma-link">
            <Info className="w-4 h-4" /> How it works
          </a>
        </header>

        <div className="enigma-grid">
          
          {/* Left Column */}
          <div className="enigma-left-col">
            
            <div className="enigma-card">
              <div className="enigma-card-bg-icon">
                <Settings />
              </div>
              <h2 className="enigma-card-title">
                <Settings className="w-4 h-4" /> Internal Settings
              </h2>
              
              <div className="enigma-settings-body">
                <div className="enigma-rotors-grid">
                  {['Left (I)', 'Middle (II)', 'Right (III)'].map((label, idx) => (
                    <div key={idx} className="enigma-setting-group">
                      <label className="enigma-label">{label}</label>
                      <select 
                        value={rotorSel[idx]} 
                        onChange={(e) => handleRotorChange(idx, e.target.value)}
                        className="enigma-select"
                      >
                        {Object.keys(ROTORS).map(r => <option key={r} value={r}>Rotor {r}</option>)}
                      </select>
                      <div className="enigma-pos-group">
                        <span className="enigma-pos-label">Pos:</span>
                        <input 
                          type="text" 
                          maxLength="1" 
                          value={initPos[idx]}
                          onChange={(e) => handlePosChange(idx, e.target.value)}
                          className="enigma-pos-input"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="enigma-divider"></div>

                <div className="enigma-bottom-settings">
                  <div>
                    <label className="enigma-label" style={{ marginBottom: '0.375rem' }}>Reflector (UKW)</label>
                    <select 
                      value={reflector} 
                      onChange={(e) => setReflector(e.target.value)}
                      className="enigma-select"
                      style={{ padding: '0.5rem 0.75rem' }}
                    >
                      {Object.keys(REFLECTORS).map(r => <option key={r} value={r}>UKW - {r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="enigma-label" style={{ marginBottom: '0.375rem' }}>Plugboard Pairs</label>
                    <input 
                      type="text" 
                      value={plugboard}
                      onChange={(e) => { setPlugboard(e.target.value); setSelectedIndex(null); }}
                      placeholder="e.g. AB CD EF"
                      className="enigma-input-wide"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Input / Output */}
            <div className="enigma-card enigma-io-card">
              <div className="enigma-io-header">
                <span className="enigma-card-title" style={{ marginBottom: 0 }}>
                  <Keyboard className="w-4 h-4" /> Transmissions
                </span>
              </div>
              <div className="enigma-io-body">
                <div className="enigma-io-section">
                  <label className="enigma-io-label">Plaintext (Input)</label>
                  <textarea 
                    value={plaintext}
                    onChange={(e) => { setPlaintext(e.target.value); setSelectedIndex(null); }}
                    className="enigma-textarea"
                    placeholder="Type message here..."
                  />
                </div>
                
                <div className="enigma-arrow-divider">
                  <ArrowDown className="w-5 h-5" />
                  <div className="enigma-arrow-line"></div>
                  <ArrowDown className="w-5 h-5" />
                </div>

                <div className="enigma-io-section">
                  <div className="enigma-io-label">
                    <span>Ciphertext (Click letters to inspect)</span>
                    <span className="enigma-char-count">{ciphertext.length} chars</span>
                  </div>
                  <div className="enigma-output-box">
                    {encryptionTrace.length === 0 && <span className="enigma-empty-msg">Output will appear here...</span>}
                    {encryptionTrace.map((step, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedIndex(idx)}
                        className={`enigma-output-char ${selectedIndex === idx ? 'active' : ''}`}
                      >
                        {step.out}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="enigma-right-col">
            <h2 className="enigma-card-title" style={{ marginBottom: '1.5rem' }}>
              <Zap className="w-4 h-4" style={{ color: 'var(--primary-main)' }} /> Active Signal Path
            </h2>

            {activeStep ? (
              <div className="enigma-viz-container">
                
                <div className="enigma-viz-headers">
                  <div className="enigma-viz-header-left">
                    <ArrowDown className="w-4 h-4" /> Signal In
                  </div>
                  <div className="enigma-viz-header-right">
                    Signal Out <ArrowUp className="w-4 h-4" />
                  </div>
                </div>

                <UPathRow 
                  label="Keyboard / Lamp" 
                  leftIn="KEY" leftOut={activeStep.in} 
                  rightIn={activeStep.out} rightOut="LMP" 
                />
                
                <UPathRow 
                  label="Plugboard (Stecker)" 
                  leftIn={activeStep.in} leftOut={activeStep.path.pb1} 
                  rightIn={activeStep.path.r3_rev} rightOut={activeStep.path.pb2} 
                />

                <div className="enigma-upath-separator">
                  <div className="enigma-upath-separator-line"><div></div></div>
                  <div className="enigma-upath-separator-label">
                    <span>Rotors (Scramblers)</span>
                  </div>
                </div>

                <UPathRow 
                  label={`Rotor III (${rotorSel[2]})`} 
                  posL={activeStep.pos[2]} posR={activeStep.pos[2]}
                  leftIn={activeStep.path.pb1} leftOut={activeStep.path.r3_out} 
                  rightIn={activeStep.path.r2_rev} rightOut={activeStep.path.r3_rev} 
                />

                <UPathRow 
                  label={`Rotor II (${rotorSel[1]})`} 
                  posL={activeStep.pos[1]} posR={activeStep.pos[1]}
                  leftIn={activeStep.path.r3_out} leftOut={activeStep.path.r2_out} 
                  rightIn={activeStep.path.r1_rev} rightOut={activeStep.path.r2_rev} 
                />

                <UPathRow 
                  label={`Rotor I (${rotorSel[0]})`} 
                  posL={activeStep.pos[0]} posR={activeStep.pos[0]}
                  leftIn={activeStep.path.r2_out} leftOut={activeStep.path.r1_out} 
                  rightIn={activeStep.path.ref_out} rightOut={activeStep.path.r1_rev} 
                  showArrows={false}
                />

                <div className="enigma-reflector-box">
                  <div className="enigma-reflector-connectors">
                     <ArrowDown className="w-4 h-4" style={{ color: 'var(--text-disabled)' }} />
                     <ArrowUp className="w-4 h-4" style={{ color: 'var(--text-disabled)' }} />
                  </div>
                  
                  <div className="enigma-reflector-inner">
                    <div className="enigma-reflector-bg"></div>
                    <span className="enigma-reflector-title">Reflector (UKW - {reflector})</span>
                    
                    <div className="enigma-reflector-flow">
                      <div className="enigma-reflector-node">
                        <span className="enigma-reflector-node-label">In</span>
                        <span className="enigma-reflector-char in">
                          {activeStep.path.r1_out}
                        </span>
                      </div>
                      
                      <div className="enigma-reflector-loop">
                         <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                            <path d="M 0,20 C 50,40 50,0 100,20" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                            <circle cx="50" cy="20" r="4" fill="currentColor" />
                         </svg>
                      </div>

                      <div className="enigma-reflector-node">
                        <span className="enigma-reflector-node-label">Out</span>
                        <span className="enigma-reflector-char out">
                          {activeStep.path.ref_out}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="enigma-awaiting">
                <div className="enigma-awaiting-icon">
                  <Lightbulb />
                </div>
                <h3 className="enigma-awaiting-title">Awaiting Selection</h3>
                <p className="enigma-awaiting-desc">
                  Type a message in the left panel, then click on any highlighted letter in the Ciphertext output to trace the electrical signal through the Enigma's circuits.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
