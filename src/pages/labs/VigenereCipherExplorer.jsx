import React, { useState, useMemo } from 'react';
import { Lock, Keyboard, RefreshCw, Hash } from 'lucide-react';
import './VigenereCipherExplorer.css';

const ALPHABET = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

export default function VigenereCipherExplorer() {
  const [plaintext, setPlaintext] = useState("VIGENERE");
  const [key, setKey] = useState("KEY");
  const [activeCharIndex, setActiveCharIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('grid');

  const cleanKey = useMemo(() => {
    const sanitized = key.toUpperCase().replace(/[^A-Z]/g, '');
    return sanitized.length > 0 ? sanitized : "A";
  }, [key]);

  const alignedChars = useMemo(() => {
    let keyIdx = 0;
    return plaintext.toUpperCase().split('').map((char, index) => {
      const charCode = char.charCodeAt(0);
      const isLetter = charCode >= 65 && charCode <= 90;
      
      if (isLetter) {
        const keyChar = cleanKey[keyIdx % cleanKey.length];
        const shift = keyChar.charCodeAt(0) - 65;
        const cipherChar = String.fromCharCode(((charCode - 65 + shift) % 26) + 65);
        keyIdx++;
        return { originalIndex: index, char, keyChar, shift, cipherChar, isLetter: true };
      }
      return { originalIndex: index, char, keyChar: '', shift: 0, cipherChar: char, isLetter: false };
    });
  }, [plaintext, cleanKey]);

  const ciphertext = useMemo(() => {
    return alignedChars.map(item => item.cipherChar).join('');
  }, [alignedChars]);

  const selectedInfo = useMemo(() => {
    const lettersOnly = alignedChars.filter(item => item.isLetter);
    if (lettersOnly.length === 0) return null;
    const safeIndex = Math.min(activeCharIndex, lettersOnly.length - 1);
    return lettersOnly[safeIndex >= 0 ? safeIndex : 0];
  }, [alignedChars, activeCharIndex]);

  const resetAll = () => {
    setPlaintext("SECRET MESSAGE");
    setKey("KEY");
    setActiveCharIndex(0);
  };

  const selectedPlainChar = selectedInfo?.char || 'A';
  const selectedKeyChar = selectedInfo?.keyChar || 'A';
  const selectedShift = selectedInfo?.shift || 0;
  const selectedCipherChar = selectedInfo?.cipherChar || 'A';

  return (
    <div className="vigenere-wrapper">
      <div className="vigenere-container">
        
        <header className="vigenere-header">
          <div className="vigenere-icon-box">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="vigenere-title">
            Vigenère Cipher Explorer
          </h1>
          <p className="vigenere-subtitle">
            A polyalphabetic substitution cipher. Rather than shifting all letters by the same amount, Vigenère shifts each letter using a repeating keyword.
          </p>
        </header>

        <div className="vigenere-card">
          <h3 className="vigenere-card-title">
            <Keyboard size={16} /> Interactive Stream Alignment
          </h3>
          <div className="vigenere-stream-container">
            {alignedChars.map((item, idx) => {
              if (!item.isLetter) {
                return (
                  <div key={idx} className="vigenere-stream-item non-letter">
                    <span className="vigenere-stream-label">Plain</span>
                    <span className="vigenere-stream-char" style={{ margin: '0.25rem 0' }}>
                      {item.char === ' ' ? '␣' : item.char}
                    </span>
                    <span className="vigenere-stream-label">Cipher</span>
                  </div>
                );
              }
              const lettersOnlyBefore = alignedChars.slice(0, idx).filter(x => x.isLetter).length;
              const isSelected = selectedInfo?.originalIndex === item.originalIndex;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveCharIndex(lettersOnlyBefore)}
                  className={`vigenere-stream-item ${isSelected ? 'active' : ''}`}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span className="vigenere-stream-label">PLAIN</span>
                    <span className="vigenere-stream-char">{item.char}</span>
                  </div>
                  <div className="vigenere-stream-shift">
                    +{item.shift}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span className="vigenere-stream-char">{item.cipherChar}</span>
                    <span className="vigenere-stream-label">KEY: {item.keyChar}</span>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="vigenere-hint">
            <span className="vigenere-pulse"></span>
            Click any letter above to analyze its encryption shift and trace it below.
          </div>
        </div>

        <div className="vigenere-card-no-pad">
          <div className="vigenere-tabs-header">
            <div className="vigenere-tabs-nav">
              <button
                onClick={() => setActiveTab('grid')}
                className={`vigenere-tab-btn ${activeTab === 'grid' ? 'active' : 'inactive'}`}
              >
                Vigenère Grid (Tabula Recta)
              </button>
              <button
                onClick={() => setActiveTab('ruler')}
                className={`vigenere-tab-btn ${activeTab === 'ruler' ? 'active' : 'inactive'}`}
              >
                Caesar Connection Ruler
              </button>
            </div>
            {selectedInfo && (
              <div className="vigenere-match-badge">
                Active Match: <span className="vigenere-match-highlight">{selectedPlainChar}</span> shifted by <span className="vigenere-match-highlight">{selectedKeyChar} (+{selectedShift})</span> = <span className="vigenere-match-highlight">{selectedCipherChar}</span>
              </div>
            )}
          </div>

          {activeTab === 'grid' && (
            <div className="vigenere-grid-container custom-scrollbar">
              <div className="vigenere-grid-inner">
                <div className="vigenere-grid-header-row">
                  {ALPHABET.map((colChar) => {
                    const isColMatch = colChar === selectedPlainChar;
                    return (
                      <div
                        key={`header-col-${colChar}`}
                        className={`vigenere-grid-col-header ${isColMatch ? 'active' : 'inactive'}`}
                      >
                        {colChar}
                      </div>
                    );
                  })}
                </div>
                <div className="vigenere-grid-body">
                  {ALPHABET.map((rowChar, rowIndex) => {
                    const isRowMatch = rowChar === selectedKeyChar;
                    return (
                      <div key={`row-${rowChar}`} className="vigenere-grid-row">
                        <div className={`vigenere-grid-row-header ${isRowMatch ? 'active' : 'inactive'}`}>
                          {rowChar}
                        </div>
                        <div className={`vigenere-grid-cells ${isRowMatch ? 'active-row' : ''}`}>
                          {ALPHABET.map((colChar, colIndex) => {
                            const isColMatch = colChar === selectedPlainChar;
                            const isIntersection = isRowMatch && isColMatch;
                            const cellChar = String.fromCharCode(((rowIndex + colIndex) % 26) + 65);
                            return (
                              <div
                                key={`cell-${rowChar}-${colChar}`}
                                className={`vigenere-grid-cell ${isIntersection ? 'intersection' : isRowMatch || isColMatch ? 'highlight' : 'normal'}`}
                              >
                                {cellChar}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ruler' && (
            <div className="vigenere-ruler-container">
              <div className="vigenere-ruler-inner">
                
                <div className="vigenere-ruler-box">
                  <div className="vigenere-ruler-label">Plaintext Alphabet</div>
                  <div className="vigenere-alphabet-track">
                    {ALPHABET.map((char, idx) => (
                      <div
                        key={`plain-${idx}`}
                        className={`vigenere-alphabet-char ${char === selectedPlainChar ? 'active' : 'inactive'}`}
                      >
                        {char}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="vigenere-connection-area">
                  <div className="vigenere-connection-line"></div>
                  <div className="vigenere-connection-badge">
                    <span className="vigenere-connection-text">Active Key Letter:</span>
                    <span className="vigenere-connection-key">
                      {selectedKeyChar}
                    </span>
                    <span className="vigenere-connection-shift">(Shift: +{selectedShift})</span>
                  </div>
                </div>

                <div className="vigenere-ruler-box">
                  <div className="vigenere-ruler-label right">Ciphertext Alphabet</div>
                  <div className="vigenere-alphabet-track cipher">
                    <div 
                      className="vigenere-ruler-sliding-track"
                      style={{
                        transform: `translateX(-${selectedShift * (100 / 26)}%)`
                      }}
                    >
                      {[...ALPHABET, ...ALPHABET].map((char, idx) => {
                        const isTargeted = char === selectedCipherChar && idx === (ALPHABET.indexOf(selectedPlainChar) + selectedShift);
                        return (
                          <div
                            key={`cipher-${idx}`}
                            style={{ width: `${100 / 52}%` }}
                            className={`vigenere-ruler-sliding-char ${isTargeted ? 'active' : 'cipher-inactive'}`}
                          >
                            {char}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        <div className="vigenere-inputs-grid">
          
          <div className="vigenere-input-card">
            <div className="vigenere-input-header">
              <label htmlFor="plaintext" className="vigenere-input-label">
                <Lock size={16} style={{ color: 'var(--success-main)' }} /> Message (Plaintext)
              </label>
              <button onClick={resetAll} className="vigenere-reset-btn">
                <RefreshCw size={12} /> Reset
              </button>
            </div>
            <textarea
              id="plaintext"
              rows={3}
              value={plaintext}
              onChange={(e) => {
                setPlaintext(e.target.value);
                setActiveCharIndex(0);
              }}
              placeholder="Enter message..."
              className="vigenere-textarea"
            />
          </div>

          <div className="vigenere-input-card">
            <div className="vigenere-input-header" style={{ paddingBottom: '0.8rem' }}>
              <label htmlFor="key" className="vigenere-input-label">
                <Hash size={16} style={{ color: 'var(--primary-main)' }} /> Repeating Keyword
              </label>
            </div>
            <input
              id="key"
              type="text"
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setActiveCharIndex(0);
              }}
              placeholder="Enter keyword..."
              className="vigenere-input-key"
            />
          </div>

        </div>

        <div className="vigenere-output-card">
          <label className="vigenere-input-label" style={{ borderBottom: '1px solid var(--divider)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            <Lock size={16} style={{ color: 'var(--error-main)' }} /> Final Encrypted Result (Ciphertext)
          </label>
          <div className="vigenere-output-box">
            {ciphertext || "..."}
          </div>
        </div>

      </div>
    </div>
  );
}
