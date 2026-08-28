import React, { useState } from 'react';
import { ArrowRight, ArrowDown, Info, Terminal, LayoutGrid, CheckCircle2 } from 'lucide-react';
import './Base64Visualizer.css';

const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

// Generate the table array for rendering
const base64Table = Array.from({ length: 64 }, (_, i) => ({
  dec: i,
  char: BASE64_ALPHABET[i]
}));

export default function Base64Visualizer() {
  const [mode, setMode] = useState('encode');
  const [inputText, setInputText] = useState('Hi!');
  const [decodeText, setDecodeText] = useState('SGkh');
  const [hoveredChar, setHoveredChar] = useState(null);

  // Core Data Processing (Encode)
  const processEncode = (text) => {
    // 1. Convert text to bytes (UTF-8 safe)
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    
    // 2. Generate 8-bit binary stream with color tracking
    const bitStream = [];
    const byteBlocks = Array.from(bytes).map((byte, idx) => {
      const colorIdx = idx % 3;
      const binStr = byte.toString(2).padStart(8, '0');
      
      const charStr = byte < 128 && byte > 31 ? String.fromCharCode(byte) : `\\x${byte.toString(16).padStart(2,'0')}`;
      
      for (let bit of binStr) {
        bitStream.push({ bit, colorIdx });
      }

      return { byte, charStr, binStr, colorIdx };
    });

    // 3. Group into 6-bit blocks
    const sixBitBlocks = [];
    let currentGroup = [];
    for (let i = 0; i < bitStream.length; i++) {
      currentGroup.push(bitStream[i]);
      if (currentGroup.length === 6) {
        sixBitBlocks.push(currentGroup);
        currentGroup = [];
      }
    }

    // 4. Handle padding for the last 6-bit block
    if (currentGroup.length > 0) {
      while (currentGroup.length < 6) {
        currentGroup.push({ bit: '0', colorIdx: -1 }); // -1 for padding bits
      }
      sixBitBlocks.push(currentGroup);
    }

    // 5. Calculate Base64 characters and padding '='
    const b64Data = sixBitBlocks.map(block => {
      const binStr = block.map(b => b.bit).join('');
      const dec = parseInt(binStr, 2);
      const char = BASE64_ALPHABET[dec];
      return { binStr, dec, char, block };
    });

    const paddingCount = (3 - (bytes.length % 3)) % 3;
    let paddingStr = '';
    for (let i = 0; i < paddingCount; i++) paddingStr += '=';

    const finalString = b64Data.map(d => d.char).join('') + paddingStr;

    return { byteBlocks, sixBitBlocks, b64Data, paddingCount, paddingStr, finalString };
  };

  // Core Data Processing (Decode)
  const processDecode = (text) => {
    const cleanText = text.replace(/[^A-Za-z0-9+/=]/g, '');
    const activeChars = cleanText.replace(/=/g, '');
    
    const b64Data = [];
    const bitStream = [];
    
    for(let i = 0; i < activeChars.length; i++) {
      const char = activeChars[i];
      const dec = BASE64_ALPHABET.indexOf(char);
      const binStr = dec.toString(2).padStart(6, '0');
      
      const block = [];
      for (let j = 0; j < 6; j++) {
          const globalBitIndex = i * 6 + j;
          const targetByteIndex = Math.floor(globalBitIndex / 8);
          const colorIdx = targetByteIndex % 3;
          const bit = binStr[j];
          block.push({ bit, colorIdx });
          bitStream.push({ bit, colorIdx });
      }
      b64Data.push({ char, dec, binStr, block });
    }

    const byteBlocks = [];
    let currentGroup = [];
    for (let i = 0; i < bitStream.length; i++) {
      currentGroup.push(bitStream[i]);
      if (currentGroup.length === 8) {
        byteBlocks.push(currentGroup);
        currentGroup = [];
      }
    }

    const byteValues = byteBlocks.map(block => parseInt(block.map(b => b.bit).join(''), 2));
    const uint8Array = new Uint8Array(byteValues);
    const decoder = new TextDecoder('utf-8', { fatal: false });
    let finalString = '';
    try {
      finalString = decoder.decode(uint8Array);
    } catch(e) {
      finalString = '[Invalid Data]';
    }

    const byteData = byteBlocks.map((block, idx) => {
      const byte = byteValues[idx];
      const charStr = byte < 128 && byte > 31 ? String.fromCharCode(byte) : `\\x${byte.toString(16).padStart(2,'0')}`;
      const binStr = block.map(b => b.bit).join('');
      return { byte, charStr, binStr, colorIdx: idx % 3, block };
    });

    return { b64Data, byteData, finalString };
  };

  const encData = processEncode(inputText);
  const decData = processDecode(decodeText);
  const activeText = mode === 'encode' ? inputText : decodeText;

  return (
    <div className="b64-wrapper">
      <div className="b64-container">
        
        {/* Header */}
        <header className="b64-header">
          <div className="b64-title-group">
            <h1 className="b64-title">
              <Terminal size={32} style={{ color: 'var(--info-main)' }} />
              Interactive Base64 Visualizer
            </h1>
            <p className="b64-subtitle">
              {mode === 'encode' 
                ? 'Watch how standard text gets broken down into 8-bit bytes, reassembled into 6-bit chunks, and mapped to the Base64 alphabet.'
                : 'Watch how Base64 characters are mapped back to 6-bit chunks, grouped into 8-bit bytes, and decoded into plain text.'}
            </p>
          </div>
          
          <div className="b64-controls">
            <div className="b64-mode-toggle">
              <button 
                onClick={() => setMode('encode')}
                className={`b64-mode-btn ${mode === 'encode' ? 'encode-active' : 'inactive'}`}
              >
                Encode Mode
              </button>
              <button 
                onClick={() => setMode('decode')}
                className={`b64-mode-btn ${mode === 'decode' ? 'decode-active' : 'inactive'}`}
              >
                Decode Mode
              </button>
            </div>
            <div className="b64-input-box">
              <input 
                type="text" 
                maxLength={mode === 'encode' ? 15 : 24}
                value={mode === 'encode' ? inputText : decodeText}
                onChange={(e) => mode === 'encode' ? setInputText(e.target.value) : setDecodeText(e.target.value)}
                placeholder={mode === 'encode' ? "Type something..." : "Paste Base64..."}
                className="b64-input"
              />
            </div>
          </div>
        </header>

        {activeText.length === 0 ? (
          <div className="b64-empty-state">
            <Info className="b64-empty-icon" />
            <p className="b64-empty-text">Enter some text to begin visualization</p>
          </div>
        ) : (
          <div className="b64-grid">
            
            {/* Left Column: The Pipeline */}
            <div className="b64-pipeline">
              
              {mode === 'encode' && (
                <>
                  {/* STEP 1: 8-bit Bytes */}
                  <section className="b64-section">
                    <div className="b64-section-line blue"></div>
                    <h2 className="b64-section-header">
                      <span className="b64-step-badge">1</span>
                      ASCII / UTF-8 to 8-BIT BYTES
                    </h2>
                    <div className="b64-flex-wrap">
                      {encData.byteBlocks.map((bb, i) => (
                        <div key={i} className={`b64-byte-block b64-bg-${bb.colorIdx}`}>
                          <span className="b64-byte-char">{bb.charStr}</span>
                          <span className="b64-byte-dec">DEC: {bb.byte}</span>
                          <span className={`b64-byte-bin b64-color-${bb.colorIdx}`}>{bb.binStr}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <div className="b64-arrow-down">
                    <ArrowDown />
                  </div>

                  {/* STEP 2: 6-bit Re-grouping */}
                  <section className="b64-section">
                    <div className="b64-section-line purple"></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <h2 className="b64-section-header" style={{ marginBottom: 0 }}>
                        <span className="b64-step-badge">2</span>
                        RE-GROUP INTO 6-BIT CHUNKS
                      </h2>
                    </div>
                    
                    <p className="b64-section-desc">
                      Base64 needs 6 bits to represent 64 possible characters (2^6 = 64). Notice how the colors from the 8-bit bytes above spill across the boundaries!
                    </p>

                    <div className="b64-flex-wrap">
                      {encData.b64Data.map((item, i) => (
                        <div 
                          key={i} 
                          className={`b64-chunk-block ${hoveredChar === item.char ? 'active' : ''}`}
                          onMouseEnter={() => setHoveredChar(item.char)}
                          onMouseLeave={() => setHoveredChar(null)}
                        >
                          {/* Render colored bits */}
                          <div className="b64-chunk-bin-group">
                            {item.block.map((b, bitIdx) => (
                              <span 
                                key={bitIdx} 
                                className={b.colorIdx === -1 ? 'b64-color-pad' : `b64-color-${b.colorIdx}`}
                                title={b.colorIdx === -1 ? 'Padding bit (0)' : `From byte ${b.colorIdx + 1}`}
                              >
                                {b.bit}
                              </span>
                            ))}
                          </div>
                          <div className="b64-chunk-meta">
                            <span>Binary</span>
                            <ArrowRight size={12} />
                            <span className="b64-chunk-dec">{item.dec}</span>
                            <span>Dec</span>
                          </div>
                          <div className="b64-chunk-char">
                            {item.char}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <div className="b64-arrow-down">
                    <ArrowDown />
                  </div>

                  {/* STEP 3: Output & Padding */}
                  <section className="b64-section">
                     <div className="b64-section-line emerald"></div>
                     <h2 className="b64-section-header">
                      <span className="b64-step-badge">3</span>
                      FINAL OUTPUT & PADDING
                    </h2>

                    <div className="b64-output-box">
                      <div className="b64-output-text-area">
                        <p className="b64-output-label">FINAL BASE64 STRING</p>
                        <div className="b64-output-string encode">
                          <span>{encData.finalString.replace(/=/g, '')}</span>
                          <span className="b64-output-padding">{encData.paddingStr}</span>
                        </div>
                      </div>

                      {encData.paddingCount > 0 && (
                        <div className="b64-padding-info">
                          <div className="b64-padding-title">
                            <Info size={12} /> PADDING ADDED
                          </div>
                          <p className="b64-padding-desc">
                            Input was <strong>{encData.byteBlocks.length}</strong> bytes. Base64 works in groups of 3 bytes (24 bits). 
                            We needed to add <strong>{encData.paddingCount}</strong> padding character(s) (<code>=</code>) to make the final output length a multiple of 4.
                          </p>
                        </div>
                      )}
                      {encData.paddingCount === 0 && (
                        <div className="b64-padding-info success">
                          <CheckCircle2 size={32} style={{ color: 'var(--success-main)' }} />
                          <p className="b64-padding-desc">
                            Input was exactly a multiple of 3 bytes ({encData.byteBlocks.length} bytes). No padding required!
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                </>
              )}

              {mode === 'decode' && (
                <>
                  {/* STEP 1: Base64 to 6-bit */}
                  <section className="b64-section">
                    <div className="b64-section-line purple"></div>
                    <h2 className="b64-section-header">
                      <span className="b64-step-badge">1</span>
                      BASE64 TO 6-BIT CHUNKS
                    </h2>
                    
                    <p className="b64-section-desc">
                      Each valid Base64 character is mapped back to its 6-bit binary value based on the Index Table.
                    </p>

                    <div className="b64-flex-wrap">
                      {decData.b64Data.map((item, i) => (
                        <div 
                          key={i} 
                          className={`b64-chunk-block ${hoveredChar === item.char ? 'active' : ''}`}
                          onMouseEnter={() => setHoveredChar(item.char)}
                          onMouseLeave={() => setHoveredChar(null)}
                        >
                          <div className="b64-chunk-char" style={{ borderTop: 'none', borderBottom: '1px solid var(--divider)', paddingTop: 0, paddingBottom: '0.5rem', marginBottom: '0.25rem', marginTop: 0 }}>
                            {item.char}
                          </div>
                          <div className="b64-chunk-meta" style={{ marginTop: '0.25rem' }}>
                            <span>Dec</span>
                            <span className="b64-chunk-dec">{item.dec}</span>
                            <ArrowRight size={12} />
                            <span>Binary</span>
                          </div>
                          <div className="b64-chunk-bin-group" style={{ marginBottom: 0, marginTop: '0.25rem' }}>
                            {item.block.map((b, bitIdx) => (
                              <span key={bitIdx} className={`b64-color-${b.colorIdx}`}>{b.bit}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <div className="b64-arrow-down">
                    <ArrowDown />
                  </div>

                  {/* STEP 2: 8-bit Re-grouping */}
                  <section className="b64-section">
                    <div className="b64-section-line blue"></div>
                    <h2 className="b64-section-header">
                      <span className="b64-step-badge">2</span>
                      RE-GROUP INTO 8-BIT BYTES
                    </h2>
                    
                    <div className="b64-flex-wrap">
                      {decData.byteData.map((bb, i) => (
                        <div key={i} className={`b64-byte-block b64-bg-${bb.colorIdx}`}>
                          <span className={`b64-byte-bin b64-color-${bb.colorIdx}`} style={{ marginBottom: '0.5rem' }}>{bb.binStr}</span>
                          <span className="b64-byte-dec">DEC: {bb.byte}</span>
                          <span className="b64-byte-char" style={{ borderTop: '1px solid var(--divider)', width: '100%', textAlign: 'center', paddingTop: '0.5rem', marginTop: '0.25rem', marginBottom: 0 }}>
                            {bb.charStr}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <div className="b64-arrow-down">
                    <ArrowDown />
                  </div>

                  {/* STEP 3: Decoded Output */}
                  <section className="b64-section">
                     <div className="b64-section-line emerald"></div>
                     <h2 className="b64-section-header">
                      <span className="b64-step-badge">3</span>
                      FINAL DECODED TEXT
                    </h2>

                    <div className="b64-output-box">
                      <div className="b64-output-text-area">
                        <p className="b64-output-label">RAW OUTPUT STRING</p>
                        <div className="b64-output-string decode">
                          <span>
                            {decData.finalString || <span style={{ color: 'var(--text-disabled)', fontStyle: 'italic', fontSize: '1.125rem' }}>No valid output</span>}
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>
                </>
              )}

            </div>

            {/* Right Column: Base64 Dictionary Table */}
            <div className="b64-dictionary">
              <h2 className="b64-dictionary-header">
                <LayoutGrid size={16} style={{ color: 'var(--info-main)' }} />
                BASE64 INDEX TABLE
              </h2>
              <p className="b64-dictionary-desc">
                Translates a 6-bit decimal value (0-63) into an ASCII character. Hover over the 6-bit chunks on the left to locate them here.
              </p>
              
              <div className="b64-dictionary-grid custom-scrollbar">
                <div className="b64-dictionary-inner">
                  {base64Table.map((item) => {
                    const isHighlighted = hoveredChar === item.char;
                    return (
                      <div 
                        key={item.dec} 
                        className={`b64-dict-item ${isHighlighted ? 'active' : ''}`}
                      >
                        <span className="b64-dict-dec">{item.dec.toString().padStart(2, '0')}</span>
                        <span className="b64-dict-char">{item.char}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
