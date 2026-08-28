import React, { useState, useMemo } from 'react';
import { ArrowDown, MoveRight, Lock, Unlock, RotateCcw } from 'lucide-react';
import './CaesarCipherExplorer.css';

const ALPHABET = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
const DOUBLE_ALPHABET = [...ALPHABET, ...ALPHABET];

const BOX_SIZE = 48; // px
const GAP = 8; // px
const STEP = BOX_SIZE + GAP; // 56px

export default function CaesarCipherExplorer() {
  const [shift, setShift] = useState(3);
  const [plaintext, setPlaintext] = useState("HELLO WORLD");
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const ciphertext = useMemo(() => {
    return plaintext
      .split('')
      .map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          return String.fromCharCode(((code - 65 + shift) % 26) + 65);
        } else if (code >= 97 && code <= 122) {
          return String.fromCharCode(((code - 97 + shift) % 26) + 97);
        }
        return char;
      })
      .join('');
  }, [plaintext, shift]);

  const handleSliderChange = (e) => {
    setShift(parseInt(e.target.value, 10));
  };

  const resetCipher = () => {
    setShift(0);
    setPlaintext("");
  };

  return (
    <div className="caesar-wrapper">
      <div className="caesar-container">
        
        <header className="caesar-header">
          <div className="caesar-icon-wrapper">
            <Lock size={32} />
          </div>
          <h1 className="caesar-title">
            Caesar Cipher Explorer
          </h1>
          <p className="caesar-description">
            Interact with the slider below to visually rotate the alphabet and see how shifting letters creates an encrypted message.
          </p>
        </header>

        <div className="caesar-card">
          <div className="caesar-card-header">
            <h2 className="caesar-card-title">
              <MoveRight size={20} style={{ color: 'var(--primary-main)' }} />
              Mapping Visualization
            </h2>
            <div className="caesar-badge">
              Key = {shift}
            </div>
          </div>
          
          <div className="caesar-visualizer custom-scrollbar">
            <div className="caesar-visualizer-inner">
              
              <div className="caesar-label">
                Plaintext (Input)
              </div>

              <div className="caesar-row" style={{ gap: `${GAP}px` }}>
                {ALPHABET.map((char, index) => {
                  const isHovered = hoveredIndex === index;
                  return (
                    <div
                      key={`top-${index}`}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className={`caesar-box-top ${isHovered ? 'hovered' : ''}`}
                      style={{ width: `${BOX_SIZE}px`, height: `${BOX_SIZE}px` }}
                    >
                      {char}
                    </div>
                  );
                })}
              </div>

              <div className="caesar-row" style={{ gap: `${GAP}px`, margin: '12px 0' }}>
                {ALPHABET.map((_, index) => (
                  <div
                    key={`arrow-${index}`}
                    className={`caesar-arrow ${hoveredIndex === index ? 'active' : 'inactive'}`}
                    style={{ width: `${BOX_SIZE}px`, height: '24px' }}
                  >
                    <ArrowDown size={hoveredIndex === index ? 24 : 18} />
                  </div>
                ))}
              </div>

              <div className="caesar-label" style={{ color: 'var(--primary-main)', marginTop: '8px' }}>
                Ciphertext (Rotated)
              </div>

              <div 
                className="caesar-bottom-wrapper"
                style={{ 
                  width: `${26 * STEP - GAP}px`,
                  padding: '24px 0',
                  margin: '-24px 0' 
                }}
              >
                <div 
                  className="caesar-bottom-track"
                  style={{ 
                    gap: `${GAP}px`, 
                    transform: `translateX(-${shift * STEP}px)` 
                  }}
                >
                  {DOUBLE_ALPHABET.map((char, index) => {
                    const topBoxIndex = index - shift;
                    const isTargeted = hoveredIndex === topBoxIndex;

                    return (
                      <div
                        key={`bottom-${index}`}
                        className={`caesar-box-bottom ${isTargeted ? 'targeted' : 'normal'}`}
                        style={{ width: `${BOX_SIZE}px`, height: `${BOX_SIZE}px` }}
                      >
                        {char}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="caesar-hint">
                <MoveRight size={16} /> Scroll horizontally on smaller screens to see the full alphabet
              </div>
            </div>
          </div>
        </div>

        <div className="caesar-grid">
          
          <div className="caesar-panel caesar-col-1">
            <div className="caesar-panel-header">
              <h3 className="caesar-panel-title">Rotation Shift</h3>
              <button 
                onClick={resetCipher}
                className="caesar-reset"
                title="Reset"
              >
                <RotateCcw size={20} />
              </button>
            </div>
            
            <div className="caesar-shift-value">
              <div className="caesar-shift-number">
                {shift}
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="25"
              value={shift}
              onChange={handleSliderChange}
              className="caesar-slider"
            />
            
            <div className="caesar-slider-labels">
              <span>0 (None)</span>
              <span>13 (ROT13)</span>
              <span>25 (Max)</span>
            </div>
          </div>

          <div className="caesar-panel caesar-col-2">
            
            <div className="caesar-input-group">
              <label htmlFor="plaintext" className="caesar-label-flex">
                <span className="caesar-label-icon">
                  <Unlock size={18} style={{ color: 'var(--success-main)' }} /> 
                  Message to Encrypt
                </span>
              </label>
              <textarea
                id="plaintext"
                rows={3}
                value={plaintext}
                onChange={(e) => setPlaintext(e.target.value)}
                placeholder="Type your secret message here..."
                className="caesar-textarea"
              />
            </div>

            <div className="caesar-input-group">
              <label htmlFor="ciphertext" className="caesar-label-flex">
                 <span className="caesar-label-icon">
                   <Lock size={18} style={{ color: 'var(--primary-main)' }} /> 
                   Encrypted Result
                 </span>
              </label>
              <textarea
                id="ciphertext"
                rows={3}
                value={ciphertext}
                readOnly
                className="caesar-textarea caesar-textarea-readonly"
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
