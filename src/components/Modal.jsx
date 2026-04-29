import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="relative w-full max-w-md bg-surface/95 backdrop-blur-md rounded-2xl shadow-2xl border border-surface-border overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-surface-border/50">
          <h3 className="text-sm font-serif font-bold text-text-primary uppercase tracking-wide">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6">
          {children}
        </div>
        
        {footer && (
          <div className="p-4 bg-surface-hover/30 flex justify-end gap-3 border-t border-surface-border/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
