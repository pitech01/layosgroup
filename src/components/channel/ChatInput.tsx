import { useState, useRef, useEffect } from 'react';
import { 
    MdFormatBold, MdFormatItalic, MdFormatUnderlined, 
    MdFormatStrikethrough, MdFormatListBulleted, 
    MdFormatListNumbered, MdInsertLink, MdFormatQuote, 
    MdCode, MdOutlineAttachFile,
    MdAlternateEmail, MdClose, MdSend, MdKeyboardArrowDown,
    MdAdd, MdTag, MdRefresh
} from 'react-icons/md';
// @ts-ignore
import './ChatInput.css';

interface ChatInputProps {
    onSendMessage: (content: string, attachment?: File) => void;
    placeholder?: string;
    isSending?: boolean;
}

const ChatInput = ({ onSendMessage, placeholder = "Type a message...", isSending = false }: ChatInputProps) => {
    const [message, setMessage] = useState('');
    const [file, setFile] = useState<File | null>(null);
    
    // Mention State
    const [showMentionMenu, setShowMentionMenu] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [mentionResults, setMentionResults] = useState<{id: string, name: string, role: string}[]>([]);
    const [isSearchingMentions, setIsSearchingMentions] = useState(false);
    
    // Use a contentEditable div instead of textarea to provide true WYSIWYG
    const editorRef = useRef<HTMLDivElement>(null);

    // Live search for platform users
    useEffect(() => {
        if (mentionQuery.length >= 2) {
            setIsSearchingMentions(true);
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
            fetch(`${API_URL}/direct-messages/search?q=${mentionQuery}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                }
            })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setMentionResults(data.map((u: any) => ({id: u.id, name: u.title, role: u.role})));
                } else {
                    setMentionResults([]);
                }
            })
            .catch(() => setMentionResults([]))
            .finally(() => setIsSearchingMentions(false));
        } else {
            setMentionResults([]);
        }
    }, [mentionQuery]);

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        // Extract raw HTML to send formatted content
        const htmlContent = editorRef.current?.innerHTML || '';
        const rawText = editorRef.current?.textContent || '';
        
        if ((rawText.trim() || file) && !isSending) {
            let finalContent = htmlContent.trim();
            if (!finalContent && file) {
                finalContent = '📎 Attachment';
            }
            onSendMessage(finalContent, file || undefined);
            
            // Clear message correctly
            setMessage('');
            if (editorRef.current) {
                editorRef.current.innerHTML = '';
            }
            
            setFile(null);
            setShowMentionMenu(false);
        }
    };

    // Execute standard rich text browser commands
    const executeCommand = (command: string, arg?: string) => {
        if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand(command, false, arg);
            setMessage(editorRef.current.innerHTML);
        }
    };

    const handleFormatBlockQuote = () => {
        executeCommand('formatBlock', 'BLOCKQUOTE');
    };

    const handleFormatCode = () => {
        const selection = window.getSelection()?.toString();
        const html = `<code>${selection || 'code'}</code>&nbsp;`;
        executeCommand('insertHTML', html);
    };

    const handleLink = () => {
        const url = prompt('Enter link URL (e.g. https://example.com):');
        if (url) {
            executeCommand('createLink', url);
        }
    };

    const insertMention = (name: string) => {
        const mentionHTML = `<strong style="color: #2563eb; background: #eff6ff; padding: 2px 6px; border-radius: 4px; user-select: none;">@${name}</strong>&nbsp;`;
        executeCommand('insertHTML', mentionHTML);
        setShowMentionMenu(false);
        setMentionQuery('');
    };

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        setMessage(e.currentTarget.innerHTML);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const ICON_SIZE = 24;

    const blackIconStyle = { color: '#000000', visibility: 'visible' as const, fill: 'currentColor', display: 'inline-block', position: 'relative' as const, zIndex: 100 };
    const whiteIconStyle = { color: '#ffffff', visibility: 'visible' as const, fill: 'currentColor', display: 'inline-block', position: 'relative' as const, zIndex: 100 };

    return (
        <div className="mega-pro-composer" style={{ position: 'relative' }}>
            <style>{`
                .mention-item-menu {
                    transition: all 0.2s;
                }
                .mention-item-menu:hover {
                    background: #eff6ff;
                }
            `}</style>
            
            {/* Top Toolbar */}
            <div className="mp-toolbar-top">
                <button type="button" className="mp-tool-icon" title="Bold" onMouseDown={(e) => { e.preventDefault(); executeCommand('bold'); }}>
                    <div><MdFormatBold size={ICON_SIZE} style={blackIconStyle} /></div>
                </button>
                <button type="button" className="mp-tool-icon" title="Italic" onMouseDown={(e) => { e.preventDefault(); executeCommand('italic'); }}>
                    <div><MdFormatItalic size={ICON_SIZE} style={blackIconStyle} /></div>
                </button>
                <button type="button" className="mp-tool-icon" title="Underline" onMouseDown={(e) => { e.preventDefault(); executeCommand('underline'); }}>
                    <div><MdFormatUnderlined size={ICON_SIZE} style={blackIconStyle} /></div>
                </button>
                <button type="button" className="mp-tool-icon" title="Strikethrough" onMouseDown={(e) => { e.preventDefault(); executeCommand('strikeThrough'); }}>
                    <div><MdFormatStrikethrough size={ICON_SIZE} style={blackIconStyle} /></div>
                </button>
                <div className="mp-sep" />
                <button type="button" className="mp-tool-icon" title="Link" onMouseDown={(e) => { e.preventDefault(); handleLink(); }}>
                    <div><MdInsertLink size={ICON_SIZE} style={blackIconStyle} /></div>
                </button>
                <button type="button" className="mp-tool-icon" title="Numbered List" onMouseDown={(e) => { e.preventDefault(); executeCommand('insertOrderedList'); }}>
                    <div><MdFormatListNumbered size={ICON_SIZE} style={blackIconStyle} /></div>
                </button>
                <button type="button" className="mp-tool-icon" title="Bulleted List" onMouseDown={(e) => { e.preventDefault(); executeCommand('insertUnorderedList'); }}>
                    <div><MdFormatListBulleted size={ICON_SIZE} style={blackIconStyle} /></div>
                </button>
                <div className="mp-sep" />
                <button type="button" className="mp-tool-icon" title="Quote" onMouseDown={(e) => { e.preventDefault(); handleFormatBlockQuote(); }}>
                    <div><MdFormatQuote size={ICON_SIZE} style={blackIconStyle} /></div>
                </button>
                <button type="button" className="mp-tool-icon" title="Code" onMouseDown={(e) => { e.preventDefault(); handleFormatCode(); }}>
                    <div><MdCode size={ICON_SIZE} style={blackIconStyle} /></div>
                </button>
            </div>

            {/* File Review Chip */}
            {file && (
                <div className="mp-file-chip">
                    <div><MdOutlineAttachFile size={20} style={{ color: '#000000', visibility: 'visible', display: 'inline-block', position: 'relative', zIndex: 100 }} /></div>
                    <span style={{ fontWeight: 600 }}>{file.name}</span>
                    <div style={{ cursor: 'pointer', display: 'flex' }} onClick={() => setFile(null)}>
                        <MdClose size={20} style={{ color: '#ef4444', visibility: 'visible', display: 'inline-block', position: 'relative', zIndex: 100 }} />
                    </div>
                </div>
            )}

            {/* Input Area (WYSIWYG) */}
            <div className="mp-input-area">
                <div 
                    ref={editorRef}
                    contentEditable
                    className="mp-textarea"
                    data-placeholder={placeholder}
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    style={{ whiteSpace: 'pre-wrap' }}
                />
            </div>

            {/* Bottom Toolbar & Pickers */}
            <div className="mp-toolbar-bottom" style={{ position: 'relative' }}>
                
                {/* Mention Dropdown Popover */}
                {showMentionMenu && (
                    <div style={{ position: 'absolute', bottom: '100%', left: '100px', marginBottom: '8px', zIndex: 9999, background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', width: '280px', overflow: 'hidden' }}>
                        <div 
                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }} 
                            onClick={(_) => { setShowMentionMenu(false); editorRef.current?.focus(); }} 
                        />
                        <div style={{ padding: '12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 800, color: '#64748b', marginBottom: '8px' }}>Tag a User</div>
                            <input 
                                autoFocus
                                type="text"
                                value={mentionQuery}
                                onChange={(e) => setMentionQuery(e.target.value)}
                                placeholder="Search by name..."
                                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem', color: '#0f172a', fontWeight: 500 }}
                            />
                        </div>
                        <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '8px' }}>
                            {mentionQuery.length < 2 ? (
                                <div style={{ padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Type at least 2 characters to search...</div>
                            ) : isSearchingMentions ? (
                                <div style={{ padding: '12px', textAlign: 'center', color: '#2563eb', fontSize: '0.85rem', fontWeight: 700 }}>Searching platform...</div>
                            ) : mentionResults.length === 0 ? (
                                <div style={{ padding: '12px', textAlign: 'center', color: '#dc2626', fontSize: '0.85rem', fontWeight: 700 }}>No users found for "{mentionQuery}"</div>
                            ) : (
                                mentionResults.map(user => (
                                    <div key={user.id} className="mention-item-menu" onMouseDown={(e) => { e.preventDefault(); insertMention(user.name); }} style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '8px 12px', cursor: 'pointer', borderRadius: '6px' }}>
                                        <span style={{ fontWeight: 800, color: '#0f172a' }}>@{user.name}</span>
                                        <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>{user.role}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                <div className="mp-tools-left">
                    <button 
                        type="button" 
                        className="mp-action-btn"
                        onClick={() => document.getElementById('mp-file-input')?.click()}
                        title="Upload File"
                        style={{ border: 'none', background: 'transparent' }}
                    >
                        <div className="mp-plus-btn">
                            <MdAdd size={ICON_SIZE} style={blackIconStyle} />
                        </div>
                        <input type="file" id="mp-file-input" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
                    </button>
                    <button 
                        type="button" 
                        className="mp-action-btn" 
                        title="Mention" 
                        onMouseDown={(e) => { e.preventDefault(); setShowMentionMenu(prev => !prev); setMentionQuery(''); }}
                    >
                        <div><MdAlternateEmail size={ICON_SIZE + 4} style={blackIconStyle} /></div>
                    </button>
                    <div className="mp-sep" />
                    <button type="button" className="mp-action-btn" title="Tags" onMouseDown={(e) => { e.preventDefault(); executeCommand('insertHTML', '#'); }}>
                        <div><MdTag size={ICON_SIZE + 4} style={blackIconStyle} /></div>
                    </button>
                </div>

                <div className={`mp-send-group ${(!message.trim() && !file) || isSending ? 'disabled' : ''}`}>
                    <button 
                        type="button" 
                        className="mp-send-btn" 
                        disabled={(!message.trim() && !file) || isSending}
                        onClick={() => handleSubmit()}
                    >
                        {isSending ? <div><MdRefresh size={ICON_SIZE} className="p-spinner" style={whiteIconStyle} /></div> : <><span>Send</span><div><MdSend size={ICON_SIZE} style={whiteIconStyle} /></div></>}
                    </button>
                    <button type="button" className="mp-send-drop" disabled={(!message.trim() && !file) || isSending}>
                        <div><MdKeyboardArrowDown size={ICON_SIZE + 4} style={whiteIconStyle} /></div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInput;
