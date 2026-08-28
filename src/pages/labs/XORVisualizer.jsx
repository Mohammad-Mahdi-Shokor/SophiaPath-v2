import React, { useState } from 'react';
import { ArrowDown, Info, Terminal, Key, FileText, Binary, ShieldAlert } from 'lucide-react';
import './XORVisualizer.css';

export default function XORVisualizer() {
  const [dataText, setDataText] = useState('Secret!');
  const [keyText, setKeyText] = useState('KEY');
  const [hoveredBitPair, setHoveredBitPair] = useState(null);

  // Core Data Processing for XOR
  const processXOR = (data, key) => {
    if (!data || !key) return { blocks: [], finalString: '' };

    const blocks = [];
    let finalString = '';

    for (let i = 0; i < data.length; i++) {
      // Data byte
      const dChar = data[i];
      const dCode = dChar.charCodeAt(0);
      const dBin = dCode.toString(2).padStart(8, '0');

      // Key byte (repeats if key is shorter than data)
      const kChar = key[i % key.length];
      const kCode = kChar.charCodeAt(0);
      const kBin = kCode.toString(2).padStart(8, '0');

      // Result byte
      const rCode = dCode ^ kCode;
      const rBin = rCode.toString(2).padStart(8, '0');
      
      // Determine if printable ASCII, otherwise show Hex representation
      const isPrintable = rCode >= 32 && rCode <= 126;
      const rChar = isPrintable ? String.fromCharCode(rCode) : `\\x${rCode.toString(16).padStart(2, '0').toUpperCase()}`;
      
      finalString += rChar;

      blocks.push({
        index: i,
        dChar, dCode, dBin: dBin.split(''),
        kChar, kCode, kBin: kBin.split(''),
        rChar, rCode, rBin: rBin.split(''),
        isPrintable
      });
    }

    return { blocks, finalString };
  };

  const { blocks, finalString } = processXOR(dataText, keyText);

  // Helper component to render individual bits with coloring
  const BitBox = ({ bit, isResult, type }) => {
    const isOne = bit === '1';
    return (
      <span className={`xor-bit ${type}-${isOne ? '1' : '0'}`}>
        {bit}
      </span>
    );
  };

  return (
    <div className="xor-wrapper">
      <div className="xor-container">
        
        {/* Header */}
        <header className="xor-header">
          <div className="xor-title-group">
            <h1 className="xor-title">
              <Binary size={32} style={{ color: 'var(--success-main)' }} />
              Interactive XOR Visualizer
            </h1>
            <p className="xor-subtitle">
              Explore the bitwise Exclusive-OR (⊕) cipher. Watch how plaintext bytes are aligned with key bytes, compared bit-by-bit, and transformed into ciphertext.
            </p>
          </div>
          
          <div className="xor-controls">
            <div className="xor-input-box">
              <FileText size={20} style={{ color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                maxLength={20}
                value={dataText}
                onChange={(e) => setDataText(e.target.value)}
                placeholder="Data to encrypt/decrypt..."
                className="xor-input"
              />
            </div>
            <div className="xor-input-box key-input">
              <Key size={20} style={{ color: 'var(--primary-main)' }} />
              <input 
                type="text" 
                maxLength={20}
                value={keyText}
                onChange={(e) => setKeyText(e.target.value)}
                placeholder="Secret Key..."
                className="xor-input"
              />
            </div>
          </div>
        </header>

        {!dataText || !keyText ? (
          <div className="xor-empty-state">
            <Info className="xor-empty-icon" />
            <p className="xor-empty-text">Enter both Data and a Key to visualize the XOR process</p>
          </div>
        ) : (
          <div className="xor-grid">
            
            {/* Left Column: The Pipeline */}
            <div className="xor-pipeline">
              
              {/* Main XOR Visualization Block */}
              <section className="xor-section">
                <div className="xor-section-line emerald"></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                  <h2 className="xor-section-header">
                    <span className="xor-step-badge">1</span>
                    BITWISE ALIGNMENT & CALCULATION
                  </h2>
                  <div className="xor-section-desc">
                    Key repeats automatically to match data length
                  </div>
                </div>

                <div className="xor-flex-wrap">
                  {blocks.map((block) => (
                    <div key={block.index} className="xor-block">
                      
                      {/* Data Row */}
                      <div className="xor-row mb-1">
                        <div className="xor-row-label-group xor-data-color">
                          <span className="xor-row-label">DATA [{block.index}]</span>
                          <span className="xor-row-char">'{block.dChar}'</span>
                        </div>
                        <div className="xor-bits-group">
                          {block.dBin.map((bit, bitIdx) => (
                            <div 
                              key={bitIdx}
                              onMouseEnter={() => setHoveredBitPair(`${block.index}-${bitIdx}`)}
                              onMouseLeave={() => setHoveredBitPair(null)}
                              className={`xor-bit-wrapper ${hoveredBitPair === `${block.index}-${bitIdx}` ? 'hovered' : ''}`}
                            >
                              <BitBox bit={bit} isResult={false} type="data" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Math Symbol */}
                      <div className="xor-math-symbol-container">
                        <div className="xor-math-symbol">
                          ⊕
                        </div>
                      </div>

                      {/* Key Row */}
                      <div className="xor-row mb-3">
                        <div className="xor-row-label-group xor-key-color">
                          <span className="xor-row-label">KEY [{block.index % keyText.length}]</span>
                          <span className="xor-row-char">'{block.kChar}'</span>
                        </div>
                        <div className="xor-bits-group">
                          {block.kBin.map((bit, bitIdx) => (
                            <div 
                              key={bitIdx}
                              onMouseEnter={() => setHoveredBitPair(`${block.index}-${bitIdx}`)}
                              onMouseLeave={() => setHoveredBitPair(null)}
                              className={`xor-bit-wrapper ${hoveredBitPair === `${block.index}-${bitIdx}` ? 'hovered' : ''}`}
                            >
                              <BitBox bit={bit} isResult={false} type="key" />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="xor-divider" />

                      {/* Result Row */}
                      <div className="xor-result-row">
                        <div className="xor-row-label-group xor-res-color">
                          <span className="xor-row-label">RESULT</span>
                          <span className="xor-row-char">
                            {block.isPrintable ? `'${block.rChar}'` : block.rChar}
                          </span>
                        </div>
                        <div className="xor-bits-group">
                          {block.rBin.map((bit, bitIdx) => (
                            <div 
                              key={bitIdx}
                              onMouseEnter={() => setHoveredBitPair(`${block.index}-${bitIdx}`)}
                              onMouseLeave={() => setHoveredBitPair(null)}
                              className={`xor-bit-wrapper ${hoveredBitPair === `${block.index}-${bitIdx}` ? 'res-hovered' : ''}`}
                            >
                              <BitBox bit={bit} isResult={true} type="res" />
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </section>

              <div className="xor-arrow-down">
                <ArrowDown />
              </div>

              {/* Final Output Section */}
              <section className="xor-section">
                 <div className="xor-section-line cyan"></div>
                 <h2 className="xor-section-header" style={{ marginBottom: '1rem' }}>
                  <span className="xor-step-badge">2</span>
                  FINAL OUTPUT (CIPHERTEXT)
                </h2>

                <div className="xor-output-box">
                  <div className="xor-output-text-area">
                    <div className="xor-output-string">
                      {finalString}
                    </div>
                  </div>

                  <div className="xor-padding-info">
                    <div className="xor-padding-title">
                      <ShieldAlert size={16} style={{ color: 'var(--warning-main)' }} /> SYMMETRIC PROPERTY
                    </div>
                    <p className="xor-padding-desc">
                      XOR is perfectly symmetric. If you take this output and XOR it with the exact same key again, you will get back your original data! Try copying the result into the Data input to see it reverse.
                    </p>
                  </div>
                </div>
              </section>

            </div>

            {/* Right Column: Reference */}
            <div className="xor-reference">
              <h2 className="xor-ref-header">
                <Terminal size={16} style={{ color: 'var(--success-main)' }} />
                TRUTH TABLE
              </h2>
              <p className="xor-ref-desc">
                Exclusive OR (XOR) outputs true (1) only when the inputs are <strong>different</strong>. If the inputs match, it outputs false (0).
              </p>
              
              <table className="xor-table">
                <thead>
                  <tr>
                    <th>Bit A</th>
                    <th>Bit B</th>
                    <th>A ⊕ B</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>0</td>
                    <td>0</td>
                    <td className="xor-table-zero">0</td>
                  </tr>
                  <tr>
                    <td>0</td>
                    <td className="xor-table-one">1</td>
                    <td className="xor-table-res-one">1</td>
                  </tr>
                  <tr>
                    <td className="xor-table-one">1</td>
                    <td>0</td>
                    <td className="xor-table-res-one">1</td>
                  </tr>
                  <tr>
                    <td className="xor-table-one">1</td>
                    <td className="xor-table-one">1</td>
                    <td className="xor-table-zero">0</td>
                  </tr>
                </tbody>
              </table>

              <div className="xor-ref-footer">
                 <h3>HEX CODES (\x..)</h3>
                 <p className="xor-ref-desc">
                   When XORing letters together, the result is often a non-printable control character (like a backspace or null character). When this happens, we display its Hexadecimal equivalent (e.g., <code>\x0A</code>) instead of rendering a broken character.
                 </p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
