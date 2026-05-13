import { useState, useRef, useEffect } from 'react';
import { Download, FileAudio, Eye, X, FileText, Trash2, Bold, Italic, Underline, Edit2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export interface Message {
    id: string;
    senderName: string;
    senderRole: 'instructor' | 'student';
    type: 'message' | 'announcement' | 'assignment';
    content: string;
    attachmentUrl?: string;
    dueDate?: string;
    isDeleted?: boolean;
    createdAt: string;
}

interface MessageCardProps {
    message: Message;
    viewerRole?: 'instructor' | 'student';
    onDelete?: () => Promise<void>;
    onEdit?: (newContent: string) => Promise<void>;
    isMine?: boolean;
    compact?: boolean;
}

const MessageCard = ({ message, viewerRole, onDelete, onEdit, isMine = false, compact = false }: MessageCardProps) => {
    const isInstructor = message.senderRole === 'instructor';
    const [viewingPdf, setViewingPdf] = useState<{ url: string; title: string } | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);
    const editorRef = useRef<HTMLDivElement>(null);
    const [isSaving, setIsSaving] = useState(false);

    const isPdf = (url: string) => {
        return /\.pdf(\?.*)?$/i.test(url.split('?')[0]);
    };

    const handleViewPdf = (e: React.MouseEvent, url: string, title?: string) => {
        if (viewerRole === 'student' && isPdf(url)) {
            e.preventDefault();
            setViewingPdf({ url, title: title || 'Resource Archive' });
        }
    };

    useEffect(() => {
        if (isEditing && editorRef.current) {
            editorRef.current.innerHTML = message.content;
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(editorRef.current);
            range.collapse(false);
            sel?.removeAllRanges();
            sel?.addRange(range);
            editorRef.current.focus();
        }
    }, [isEditing, message.content]);

    const handleFormat = (command: string) => {
        document.execCommand(command, false);
        if (editorRef.current) {
            setEditContent(editorRef.current.innerHTML);
        }
    };

    return (
        <div className={`flex flex-col w-full mb-4 px-2 md:px-4 ${isMine ? 'items-end' : 'items-start'} ${compact ? 'mt-1' : 'mt-4'}`}>
            {!compact && (
                <div className={`flex items-center gap-2 mb-1 px-1 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-[10px] font-black uppercase tracking-wider text-brand-muted">
                        {message.senderName} {isInstructor && '• Instructor'}
                    </span>
                    <span className="text-[10px] font-medium text-brand-muted/60">
                        {message.createdAt}
                    </span>
                </div>
            )}

            <div className={`group relative max-w-[85%] md:max-w-[70%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                {/* Message Bubble */}
                <div className={`
                    relative px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm transition-all duration-200
                    ${isMine 
                        ? 'bg-brand-emerald text-white rounded-tr-none' 
                        : isInstructor 
                            ? 'bg-brand-charcoal text-white rounded-tl-none' 
                            : 'bg-white text-brand-charcoal border border-brand-border rounded-tl-none'}
                    ${message.isDeleted ? 'opacity-60 italic' : ''}
                    ${message.type === 'announcement' ? 'border-2 border-red-500/30' : ''}
                `}>
                    {message.isDeleted ? (
                        <span>This message was deleted</span>
                    ) : isEditing ? (
                        <div className="min-w-[200px] md:min-w-[300px]">
                            <div className="flex gap-1 mb-2 pb-2 border-b border-white/20">
                                <button onMouseDown={(e) => { e.preventDefault(); handleFormat('bold'); }} className="p-1 hover:bg-white/10 rounded transition-colors" title="Bold">
                                    <Bold size={14} />
                                </button>
                                <button onMouseDown={(e) => { e.preventDefault(); handleFormat('italic'); }} className="p-1 hover:bg-white/10 rounded transition-colors" title="Italic">
                                    <Italic size={14} />
                                </button>
                                <button onMouseDown={(e) => { e.preventDefault(); handleFormat('underline'); }} className="p-1 hover:bg-white/10 rounded transition-colors" title="Underline">
                                    <Underline size={14} />
                                </button>
                            </div>
                            <div 
                                ref={editorRef}
                                contentEditable
                                onInput={(e) => setEditContent(e.currentTarget.innerHTML)}
                                className="outline-none min-h-[40px] text-white overflow-y-auto"
                            />
                            <div className="flex justify-end gap-2 mt-3">
                                <button 
                                    onClick={() => { setIsEditing(false); setEditContent(message.content); }}
                                    className="px-2 py-1 text-[10px] font-bold border border-white/30 rounded hover:bg-white/10 transition-colors"
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={async () => {
                                        if(onEdit) {
                                            setIsSaving(true);
                                            await onEdit(editContent);
                                            setIsSaving(false);
                                            setIsEditing(false);
                                        }
                                    }}
                                    className="px-2 py-1 text-[10px] font-bold bg-white text-brand-emerald rounded hover:bg-opacity-90 transition-colors"
                                    disabled={isSaving || (editContent === message.content)}
                                >
                                    {isSaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="prose prose-sm prose-invert max-w-none break-words overflow-hidden">
                            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                {message.content}
                            </ReactMarkdown>
                        </div>
                    )}

                    {/* Announcement Badge */}
                    {message.type === 'announcement' && !message.isDeleted && (
                        <div className="absolute -top-3 -right-2 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-lg ring-2 ring-white">
                            Alert
                        </div>
                    )}
                </div>

                {/* Attachments */}
                {message.attachmentUrl && !message.isDeleted && (
                    <div className={`mt-2 w-full max-w-[320px] ${isMine ? 'ml-auto' : 'mr-auto'}`}>
                        {/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(message.attachmentUrl.split('?')[0]) ? (
                            <div className="relative group/img rounded-xl overflow-hidden border border-brand-border shadow-sm">
                                <img src={message.attachmentUrl} alt="Attachment" loading="lazy" className="w-full h-auto max-h-[200px] object-cover transition-transform duration-300 group-hover/img:scale-105" />
                                <a href={message.attachmentUrl} target="_blank" rel="noreferrer" className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity">
                                    <div className="bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/30 text-white">
                                        <Eye size={20} />
                                    </div>
                                </a>
                            </div>
                        ) : /\.(mp3|wav|ogg|webm|m4a)(\?.*)?$/i.test(message.attachmentUrl.split('?')[0]) ? (
                            <div className="bg-white border border-brand-border p-2 rounded-xl flex items-center gap-2 shadow-sm">
                                <FileAudio size={18} className="text-brand-emerald" />
                                <audio controls src={message.attachmentUrl} className="h-8 flex-1" />
                            </div>
                        ) : (
                            <a
                                href={message.attachmentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-3 p-3 bg-white border border-brand-border rounded-xl hover:bg-brand-beige transition-all shadow-sm no-underline group/file"
                                onClick={(e) => handleViewPdf(e, message.attachmentUrl!, 'Attachment')}
                            >
                                <div className="bg-brand-beige p-2 rounded-lg text-brand-emerald group-hover/file:bg-brand-emerald group-hover/file:text-white transition-colors">
                                    <Download size={18} />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-bold text-brand-charcoal truncate max-w-[180px]">
                                        {message.attachmentUrl.split('/').pop()?.split('?')[0] || 'Attachment'}
                                    </span>
                                    <span className="text-[10px] text-brand-muted font-medium">
                                        {viewerRole === 'student' && isPdf(message.attachmentUrl) ? 'Secure PDF' : 'Download'}
                                    </span>
                                </div>
                            </a>
                        )}
                    </div>
                )}

                {/* Actions (Hover) */}
                {!message.isDeleted && !isEditing && (
                    <div className={`
                        absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 bg-white border border-brand-border rounded-lg shadow-md p-1 z-10
                        ${isMine ? 'right-full mr-2' : 'left-full ml-2'}
                    `}>
                        {onEdit && (
                            <button 
                                className="p-1.5 hover:bg-brand-beige text-brand-muted hover:text-brand-charcoal rounded transition-colors"
                                onClick={() => setIsEditing(true)}
                                title="Edit"
                            >
                                <Edit2 size={14} />
                            </button>
                        )}
                        {onDelete && (
                            <button 
                                className="p-1.5 hover:bg-red-50 text-brand-muted hover:text-red-500 rounded transition-colors"
                                onClick={() => onDelete()}
                                title="Delete"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Secure PDF Viewer Modal */}
            {viewingPdf && (
                <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[2rem] overflow-hidden flex flex-col shadow-2xl relative">
                        <div className="flex items-center justify-between p-4 md:p-6 border-b border-brand-border bg-white">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm md:text-base font-black text-brand-charcoal truncate max-w-[200px] md:max-w-md">{viewingPdf?.title}</h3>
                                    <p className="text-[10px] text-brand-muted font-bold uppercase tracking-wider">Secure Viewer • Read Only</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setViewingPdf(null)}
                                className="p-2 hover:bg-brand-beige text-brand-muted hover:text-brand-charcoal rounded-xl transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 bg-brand-beige relative overflow-hidden" onContextMenu={(e) => e.preventDefault()}>
                            <iframe
                                src={`${viewingPdf.url}#toolbar=0&navpanes=0`}
                                className="w-full h-full border-none"
                                title="Secure PDF Viewer"
                            />
                            {/* Protection Overlay */}
                            <div className="absolute inset-0 bg-transparent pointer-events-none" />
                        </div>

                        <div className="p-3 text-center border-t border-brand-border bg-white">
                            <p className="text-[10px] text-brand-muted font-bold tracking-widest uppercase italic">Protected by Layos Security Protocol</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessageCard;
