import React from 'react';
import { Play, Pause, RotateCcw, Settings2, Sparkles, AlertCircle, X, Languages, Globe, Brain } from 'lucide-react';
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
      bottom: '2rem',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 3000,
      width: '90%',
      maxWidth: '600px',
      animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%, 20px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .tts-control-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          border-radius: 50%;
          transition: all 0.2s;
        }
        .tts-control-btn:hover { background: rgba(255,255,255,0.1); }
        .tts-control-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .tts-glass {
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5);
          padding: 1rem 1.5rem;
        }
        .teaching-badge {
          background: linear-gradient(135deg, #8b5cf6, #d946ef);
          color: white;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
      `}</style>

      <div className="tts-glass">
        {/* Progress Bar Top */}
        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginBottom: '1rem', overflow: 'hidden' }}>
          <div style={{ 
            height: '100%', 
            background: tts.isTeachingMode ? 'linear-gradient(90deg, #8b5cf6, #d946ef)' : 'linear-gradient(90deg, #10b981, #3b82f6)', 
            width: `${tts.progressPct}%`, 
            transition: 'width 0.4s ease' 
          }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Main Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              className="tts-control-btn" 
              onClick={tts.restart} 
              title="Restart"
            >
              <RotateCcw size={18} />
            </button>
            
            <button 
              className="tts-control-btn" 
              style={{ background: 'white', color: '#0f172a', width: '44px', height: '44px' }}
              onClick={tts.ttsState === 'playing' ? tts.pause : tts.play}
            >
              {tts.ttsState === 'playing' ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" style={{ marginLeft: '2px' }} />}
            </button>
          </div>

          {/* Info Section */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {tts.ttsState === 'extracting' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="animate-spin" style={{ width: 14, height: 14, border: '2px solid #10b981', borderTopColor: 'transparent', borderRadius: '50%' }} />
                <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 700 }}>Extracting Knowledge {tts.indexingProgress}%</span>
              </div>
            ) : tts.ttsState === 'processing' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="animate-pulse" style={{ color: '#d946ef' }}>
                   <Brain size={16} />
                </div>
                <span style={{ color: '#d946ef', fontSize: '0.85rem', fontWeight: 700 }}>AI Teacher is preparing explanation...</span>
              </div>
            ) : tts.ttsState === 'error' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444' }}>
                <AlertCircle size={14} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{tts.ttsError || 'Extraction Failed'}</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {tts.isTeachingMode && (
                  <div className="teaching-badge">
                    <Sparkles size={10} /> AI Teaching Mode
                  </div>
                )}
                <span style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {tts.engine === 'ai' ? `MMS Engine (${tts.language.toUpperCase()})` : 'Natural Voice'} • {tts.currentChunk} of {tts.totalChunks}
                </span>
                <span style={{ 
                  color: 'white', 
                  fontSize: '0.875rem', 
                  fontWeight: 500, 
                  lineHeight: '1.4',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  maxHeight: '2.8em',
                  opacity: 0.9,
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                }}>
                  {tts.currentChunkText || 'Initializing teacher session...'}
                </span>
              </div>
            )}
          </div>

          {/* Engine & Mode Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              className="tts-control-btn"
              onClick={() => tts.setIsTeachingMode(!tts.isTeachingMode)}
              style={{ 
                background: tts.isTeachingMode ? 'rgba(217, 70, 239, 0.2)' : 'transparent',
                color: tts.isTeachingMode ? '#d946ef' : 'white',
                border: tts.isTeachingMode ? '1px solid rgba(217, 70, 239, 0.3)' : 'none'
              }}
              title={tts.isTeachingMode ? 'Disable AI Teacher' : 'Enable AI Teaching Mode (Puter.js)'}
            >
              <Brain size={18} />
            </button>

            <button 
              className="tts-control-btn"
              onClick={() => tts.setEngine(tts.engine === 'native' ? 'ai' : 'native')}
              style={{ 
                background: tts.engine === 'ai' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                color: tts.engine === 'ai' ? '#60a5fa' : 'white',
                border: tts.engine === 'ai' ? '1px solid rgba(96, 165, 250, 0.3)' : 'none'
              }}
              title={tts.engine === 'ai' ? 'AI Voice Enabled (MMS)' : 'Switch to AI Voice (African Tone)'}
            >
              {tts.ttsState === 'processing' ? <div className="animate-spin" style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%' }} /> : <Sparkles size={18} />}
            </button>

            <button 
              className="tts-control-btn" 
              onClick={() => setShowSettings(!showSettings)}
              style={{ background: showSettings ? 'rgba(255,255,255,0.1)' : 'transparent' }}
            >
              <Settings2 size={18} />
            </button>

            {onClose && (
               <button className="tts-control-btn" onClick={onClose}>
                 <X size={18} />
               </button>
            )}
          </div>
        </div>

        {/* Settings Panel Overlay */}
        {showSettings && (
          <div style={{ 
            marginTop: '1rem', 
            paddingTop: '1rem', 
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                {tts.engine === 'native' ? (
                  <>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      <Languages size={12} /> Narrator Voice
                    </label>
                    <select 
                      value={tts.selectedVoice?.name || ''} 
                      onChange={(e) => {
                        const v = tts.availableVoices.find(v => v.name === e.target.value);
                        if (v) tts.setVoice(v);
                      }}
                      style={{ width: '100%', background: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: '8px', padding: '0.4rem', fontSize: '0.85rem', outline: 'none' }}
                    >
                      {tts.availableVoices.map(v => (
                        <option key={v.name} value={v.name}>{cleanVoiceName(v.name)} ({v.lang})</option>
                      ))}
                    </select>
                  </>
                ) : (
                  <>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      <Globe size={12} /> African Tone Engine
                    </label>
                    <select 
                      value={tts.language} 
                      onChange={(e) => tts.setLanguage(e.target.value)}
                      style={{ width: '100%', background: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: '8px', padding: '0.4rem', fontSize: '0.85rem', outline: 'none' }}
                    >
                      <option value="eng">English (MMS Eng)</option>
                      <option value="yor">Yoruba (MMS Yor)</option>
                      <option value="hau">Hausa (MMS Hau)</option>
                      <option value="swh">Swahili (MMS Swh)</option>
                    </select>
                  </>
                )}
              </div>

              <div style={{ width: '120px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.3rem', display: 'block' }}>Rate ({tts.rate}x)</label>
                  <input 
                    type="range" min="0.5" max="1.5" step="0.05" 
                    value={tts.rate} 
                    onChange={(e) => tts.setRate(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#10b981' }}
                  />
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.3rem', display: 'block' }}>Pitch ({tts.pitch}x)</label>
                  <input 
                    type="range" min="0.5" max="1.5" step="0.05" 
                    value={tts.pitch} 
                    onChange={(e) => tts.setPitch(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#3b82f6' }}
                  />
                </div>
              </div>
            </div>
            
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Languages size={10} /> {tts.engine === 'ai' ? 'MMS models provide authentic tones. Adjust Rate & Pitch for gender simulation.' : 'Native voices use browser defaults. SA English (en-ZA) is prioritized.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadAloudControls;
