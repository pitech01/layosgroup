import { useState, useRef, useEffect } from 'react';
import { 
    Bold, Italic, Underline, Link, List, ListOrdered, Quote, Code, 
    Paperclip, AtSign, X, Send, Plus, Hash, RefreshCw
} from 'lucide-react';

interface ChatInputProps {
    onSendMessage: (content: string, attachment?: File) => void;
    placeholder?: string;
    isSending?: boolean;
}

const ChatInput = ({ onSendMessage, placeholder = "Type a message...", isSending = false }: ChatInputProps) => {
    const [message, setMessage] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [showMentionMenu, setShowMentionMenu] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [mentionResults, setMentionResults] = useState<{id: string, name: string, role: string}[]>([]);
    const [isSearchingMentions, setIsSearchingMentions] = useState(false);
    const [showToolbar, setShowToolbar] = useState(false);
    
    const editorRef = useRef<HTMLDivElement>(null);

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
        
        const htmlContent = editorRef.current?.innerHTML || '';
        const rawText = editorRef.current?.textContent || '';
        
        if ((rawText.trim() || file) && !isSending) {
            let finalContent = htmlContent.trim();
            if (!finalContent && file) {
                finalContent = '📎 Attachment';
            }
            onSendMessage(finalContent, file || undefined);
            
            setMessage('');
            if (editorRef.current) {
                editorRef.current.innerHTML = '';
            }
            
            setFile(null);
            setShowMentionMenu(false);
        }
    };

    const executeCommand = (command: string, arg?: string) => {
        if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand(command, false, arg);
            setMessage(editorRef.current.innerHTML);
        }
    };

    const handleFormatCode = () => {
        const selection = window.getSelection()?.toString();
        const html = `<code>${selection || 'code'}</code>&nbsp;`;
        executeCommand('insertHTML', html);
    };

    const handleLink = () => {
        const url = prompt('Enter link URL:');
        if (url) {
            executeCommand('createLink', url);
        }
    };

    const insertMention = (name: string) => {
        const mentionHTML = `<strong class="text-brand-emerald bg-brand-emerald/10 px-1 rounded">@${name}</strong>&nbsp;`;
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

    return (
        <div className="flex flex-col mx-2 md:mx-4 mb-4 bg-white border border-brand-border rounded-[24px] shadow-lg transition-all duration-300 focus-within:shadow-xl focus-within:border-brand-emerald/30 overflow-hidden relative">
            
            {/* Mention Menu */}
            {showMentionMenu && (
                <div className="absolute bottom-full left-4 mb-2 w-72 bg-white border border-brand-border rounded-2xl shadow-2xl z-1000000  animate-in slide-in-from-bottom-2">
                    <div className="p-3 bg-brand-beige/50 border-b border-brand-border">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Mention User</span>
                            <button onClick={() => setShowMentionMenu(false)} className="text-brand-muted hover:text-brand-charcoal">
                                <X size={14} />
                            </button>
                        </div>
                        <input 
                            autoFocus
                            type="text"
                            value={mentionQuery}
                            onChange={(e) => setMentionQuery(e.target.value)}
                            placeholder="Search by name..."
                            className="w-full px-3 py-2 text-xs bg-white border border-brand-border rounded-lg outline-none focus:border-brand-emerald"
                        />
                    </div>
                    <div className="max-h-48 overflow-y-auto p-1">
                        {mentionQuery.length < 2 ? (
                            <div className="p-4 text-center text-xs text-brand-muted font-medium">Type to search...</div>
                        ) : isSearchingMentions ? (
                            <div className="p-4 text-center text-xs text-brand-emerald font-bold animate-pulse">Searching...</div>
                        ) : mentionResults.length === 0 ? (
                            <div className="p-4 text-center text-xs text-red-500 font-medium">No results</div>
                        ) : (
                            mentionResults.map(user => (
                                <button 
                                    key={user.id} 
                                    onMouseDown={(e) => { e.preventDefault(); insertMention(user.name); }}
                                    className="w-full flex flex-col items-start gap-0.5 px-3 py-2 hover:bg-brand-beige rounded-xl transition-colors text-left"
                                >
                                    <span className="text-sm font-bold text-brand-charcoal">@{user.name}</span>
                                    <span className="text-[10px] font-black uppercase text-brand-muted">{user.role}</span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Formatting Toolbar (Collapsible on Mobile) */}
            {(showToolbar || (typeof window !== 'undefined' && window.innerWidth > 768)) && (
                <div className="flex items-center gap-1 p-2 bg-brand-beige/30 border-b border-brand-border overflow-x-auto no-scrollbar">
                    {[
                        { icon: Bold, cmd: 'bold', label: 'Bold' },
                        { icon: Italic, cmd: 'italic', label: 'Italic' },
                        { icon: Underline, cmd: 'underline', label: 'Underline' },
                        { icon: ListOrdered, cmd: 'insertOrderedList', label: 'List' },
                        { icon: List, cmd: 'insertUnorderedList', label: 'Bullets' },
                        { icon: Quote, cmd: 'formatBlock', arg: 'BLOCKQUOTE', label: 'Quote' },
                        { icon: Code, click: handleFormatCode, label: 'Code' },
                        { icon: Link, click: handleLink, label: 'Link' },
                    ].map((btn, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => btn.click ? btn.click() : executeCommand(btn.cmd!, btn.arg)}
                            className="p-2 hover:bg-white rounded-lg text-brand-muted hover:text-brand-emerald transition-colors shrink-0"
                            title={btn.label}
                        >
                            <btn.icon size={16} />
                        </button>
                    ))}
                </div>
            )}

            {/* File Chip */}
            {file && (
                <div className="flex items-center gap-2 m-3 p-2 pr-3 bg-brand-beige rounded-xl border border-brand-border w-fit animate-in slide-in-from-left-2">
                    <div className="bg-white p-1.5 rounded-lg text-brand-emerald shadow-sm">
                        <Paperclip size={14} />
                    </div>
                    <span className="text-xs font-bold text-brand-charcoal max-w-[200px] truncate">{file.name}</span>
                    <button onClick={() => setFile(null)} className="ml-1 text-red-500 hover:text-red-600 transition-colors">
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Composer Area */}
            <div className="flex items-end gap-2 p-3 min-h-[56px]">
                <button 
                    type="button"
                    onClick={() => document.getElementById('chat-file-input')?.click()}
                    className="p-2.5 bg-brand-beige hover:bg-brand-border text-brand-muted hover:text-brand-charcoal rounded-full transition-all duration-200 shrink-0"
                >
                    <Plus size={20} />
                    <input type="file" id="chat-file-input" className="hidden" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
                </button>

                <div className="flex-1 min-w-0 py-2">
                    <div 
                        ref={editorRef}
                        contentEditable
                        onInput={handleInput}
                        onKeyDown={handleKeyDown}
                        data-placeholder={placeholder}
                        className="w-full max-h-48 overflow-y-auto outline-none text-sm text-brand-charcoal font-medium leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-brand-muted/60 empty:before:pointer-events-none"
                    />
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <button 
                        type="button"
                        onClick={() => setShowToolbar(!showToolbar)}
                        className={`md:hidden p-2.5 rounded-full transition-colors ${showToolbar ? 'text-brand-emerald bg-brand-emerald/10' : 'text-brand-muted hover:bg-brand-beige'}`}
                    >
                        <Hash size={20} />
                    </button>
                    
                    <button 
                        type="button"
                        onClick={() => setShowMentionMenu(!showMentionMenu)}
                        className="p-2.5 text-brand-muted hover:bg-brand-beige rounded-full transition-colors"
                    >
                        <AtSign size={20} />
                    </button>

                    <button 
                        type="button"
                        onClick={handleSubmit}
                        disabled={(!message.trim() && !file) || isSending}
                        className={`
                            p-2.5 rounded-full transition-all duration-300 shadow-md
                            ${(!message.trim() && !file) || isSending 
                                ? 'bg-brand-beige text-brand-muted shadow-none cursor-not-allowed' 
                                : 'bg-brand-emerald text-white hover:scale-105 active:scale-95 shadow-[0_4px_12px_rgba(5,150,105,0.3)]'}
                        `}
                    >
                        {isSending ? <RefreshCw size={20} className="animate-spin" /> : <Send size={20} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInput;
