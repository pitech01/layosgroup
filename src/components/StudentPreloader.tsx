import React from 'react';

const Preloader: React.FC = () => {
    return (
        <div className="fixed inset-0 z-5000000 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 w-full h-full">
            <div className="flex flex-col items-center space-y-6">
                {/* Logo with a gentle pulse effect */}
                <div className="relative">
                    <img 
                        src="/logo.png" 
                        alt="Loading..." 
                        className="h-32 w-32 object-contain animate-pulse"
                    />
                </div>
                
                {/* Modern, smooth LMS spinner */}
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-brand-emerald dark:border-slate-700 dark:border-t-indigo-400" />
                
                {/* Micro-copy to enhance UX */}
                <p className="text-sm font-medium tracking-wide text-slate-500 dark:text-slate-400 animate-pulse">
                    Preparing your classroom...
                </p>
            </div>
        </div>
    );
};

export default Preloader;