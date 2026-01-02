
import React, { useState, useRef } from 'react';
import { RoutineInput } from '../types';

interface UploadSectionProps {
  onComplete: (input: RoutineInput) => void;
  isLoading: boolean;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ onComplete, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file: File) => {
    if (file.size > 15 * 1024 * 1024) return alert("Mi límite es de 15MB.");
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      const type = file.type.includes('pdf') ? 'pdf' : file.type.includes('video') ? 'video' : 'image';
      onComplete({ type, content: base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full animate-enter">
      <div 
        onClick={() => !isLoading && fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
        className={`
          group relative flex flex-col items-center justify-center p-12 min-h-[400px] rounded-[48px] border-4 border-dashed transition-all duration-500 cursor-pointer
          ${dragActive ? 'border-slate-900 bg-slate-50 dark:border-white dark:bg-slate-900' : 'border-slate-100 bg-transparent hover:border-slate-200 dark:border-slate-900 dark:hover:border-slate-800'}
        `}
      >
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf,video/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        
        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-8 border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-transform">
          <span className="material-symbols-rounded text-4xl text-slate-900 dark:text-white">
            {isLoading ? 'sync' : 'upload_file'}
          </span>
        </div>

        <h2 className="text-3xl font-bold text-center mb-4 leading-tight">
          Suelta tu rutina aquí
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-center text-lg max-w-sm">
          Soporta capturas, PDFs de tu entrenador o videos de tus levantamientos.
        </p>

        <div className="mt-12 flex gap-4">
          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-full text-xs font-bold uppercase tracking-widest opacity-50">PDF</div>
          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-full text-xs font-bold uppercase tracking-widest opacity-50">IMG</div>
          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-full text-xs font-bold uppercase tracking-widest opacity-50">MP4</div>
        </div>
      </div>
    </div>
  );
};
