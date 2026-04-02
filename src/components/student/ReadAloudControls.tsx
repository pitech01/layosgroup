import React from 'react';
import { Play, Pause, RotateCcw, Settings2, Sparkles, AlertCircle, X, Brain } from 'lucide-react';
import { type UsePdfTtsResult, cleanVoiceName } from '../../utils/usePdfTts';

interface ReadAloudControlsProps {
  tts: UsePdfTtsResult;
  onClose?: () => void;
}

const ReadAloudControls: React.FC<ReadAloudControlsProps> = ({ tts, onClose }) => {
  const [showSettings, setShowSettings] = React.useState(false);

  if (tts.ttsState === 'idle') return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.25rem',
      right: '1.25rem',
      zIndex: 3000,
      width: 'auto',
      maxWidth: '380px',
      animation: 'slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <style>{`
        @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .tts-control-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.4rem;
          border-radius: 50%;
          transition: all 0.2s;
        }
        .tts-control-btn:hover { background: rgba(255,255,255,0.1); }
        .tts-control-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .tts-glass {
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.4);
          padding: 0.6rem 1rem;
          position: relative;
          overflow: hidden;
        }
        .teaching-badge {
          background: linear-gradient(135deg, #8b5cf6, #d946ef);
          color: white;
          font-size: 0.55rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 2px;
          display: inline-flex;
          align-items: center;
          gap: 3px;
        }
      `}</style>

      <div className="tts-glass">
        {/* Progress Bar (Attached to top) */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2.5px', background: 'rgba(255,255,255,0.05)' }}>
          <div style={{ 
            height: '100%', 
            background: tts.isTeachingMode ? 'linear-gradient(90deg, #8b5cf6, #d946ef)' : 'linear-gradient(90deg, #10b981, #3b82f6)', 
            width: `${tts.progressPct}%`, 
            transition: 'width 0.4s ease' 
          }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '2px' }}>
          {/* Main Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <button 
              className="tts-control-btn" 
              onClick={tts.restart} 
              title="Restart"
            >
              <RotateCcw size={14} />
            </button>
            
            <button 
              className="tts-control-btn" 
              style={{ background: 'white', color: '#0f172a', width: '36px', height: '36px' }}
              onClick={tts.ttsState === 'playing' ? tts.pause : tts.play}
            >
              {tts.ttsState === 'playing' ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" style={{ marginLeft: '1.5px' }} />}
            </button>
          </div>

          {/* Info Section */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {tts.ttsState === 'extracting' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div className="animate-spin" style={{ width: 12, height: 12, border: '2px solid #10b981', borderTopColor: 'transparent', borderRadius: '50%' }} />
                <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 700 }}>{tts.indexingProgress}%</span>
              </div>
            ) : tts.ttsState === 'processing' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div className="animate-pulse" style={{ color: '#d946ef' }}>
                   <Brain size={14} />
                </div>
                <span style={{ color: '#d946ef', fontSize: '0.75rem', fontWeight: 700 }}>Loading...</span>
              </div>
            ) : tts.ttsState === 'error' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444' }}>
                <AlertCircle size={12} />
                <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Error</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {tts.isTeachingMode && (
                  <div className="teaching-badge">
                    <Sparkles size={8} /> AI Mode
                  </div>
                )}
                <span style={{ color: '#94a3b8', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>
                  {tts.engine === 'ai' ? `MMS (${tts.language.toUpperCase()})` : 'Native'} • {tts.currentChunk}/{tts.totalChunks}
                </span>
                <span style={{ 
                  color: 'white', 
                  fontSize: '0.75rem', 
                  fontWeight: 500, 
                  lineHeight: '1.2',
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  opacity: 0.85,
                  marginTop: '2px'
                }}>
                  {tts.currentChunkText || 'Loading...'}
                </span>
              </div>
            )}
          </div>

          {/* Engine & Mode Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <button 
              className="tts-control-btn"
              onClick={() => tts.setIsTeachingMode(!tts.isTeachingMode)}
              style={{ 
                background: tts.isTeachingMode ? 'rgba(217, 70, 239, 0.15)' : 'transparent',
                color: tts.isTeachingMode ? '#d946ef' : 'white',
              }}
              title={tts.isTeachingMode ? 'Disable AI Assistant' : 'Enable AI Assistant'}
            >
              <Brain size={14} />
            </button>

            <button 
              className="tts-control-btn" 
              onClick={() => setShowSettings(!showSettings)}
              style={{ background: showSettings ? 'rgba(255,255,255,0.1)' : 'transparent' }}
            >
              <Settings2 size={14} />
            </button>

            {onClose && (
               <button className="tts-control-btn" onClick={onClose}>
                 <X size={14} />
               </button>
            )}
          </div>
        </div>

        {/* Settings Panel Overlay */}
        {showSettings && (
          <div style={{ 
            marginTop: '0.6rem', 
            paddingTop: '0.6rem', 
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                {tts.engine === 'native' ? (
                  <>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      Voice
                    </label>
                    <select 
                      value={tts.selectedVoice?.name || ''} 
                      onChange={(e) => {
                        const v = tts.availableVoices.find(v => v.name === e.target.value);
                        if (v) tts.setVoice(v);
                      }}
                      style={{ width: '100%', background: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: '6px', padding: '0.3rem', fontSize: '0.75rem', outline: 'none' }}
                    >
                      {tts.availableVoices.map(v => (
                        <option key={v.name} value={v.name}>{cleanVoiceName(v.name)}</option>
                      ))}
                    </select>
                  </>
                ) : (
                  <>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      Region Tones
                    </label>
                    <select 
                      value={tts.language} 
                      onChange={(e) => tts.setLanguage(e.target.value)}
                      style={{ width: '100%', background: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: '6px', padding: '0.3rem', fontSize: '0.75rem', outline: 'none' }}
                    >
                      <option value="eng">English</option>
                      <option value="yor">Yoruba</option>
                      <option value="hau">Hausa</option>
                      <option value="swh">Swahili</option>
                    </select>
                  </>
                )}
              </div>

              <div style={{ width: '100px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>Rate {tts.rate}x</label>
                  <input 
                    type="range" min="0.5" max="1.5" step="0.05" 
                    value={tts.rate} 
                    onChange={(e) => tts.setRate(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#10b981', height: '14px' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadAloudControls;
