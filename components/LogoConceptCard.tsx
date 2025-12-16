import React from 'react';
import { LogoConcept } from '../types';
import { Download, Copy, RefreshCw, Palette, Type as TypeIcon } from 'lucide-react';

interface LogoConceptCardProps {
  concept: LogoConcept;
}

export const LogoConceptCard: React.FC<LogoConceptCardProps> = ({ concept }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(concept.imagePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (concept.imageUrl) {
      const link = document.createElement('a');
      link.href = concept.imageUrl;
      link.download = `${concept.title.replace(/\s+/g, '-').toLowerCase()}-logo.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow duration-300">
      {/* Image Area */}
      <div className="aspect-square bg-slate-100 relative group flex items-center justify-center p-8">
        {concept.isLoadingImage ? (
          <div className="flex flex-col items-center gap-3 animate-pulse">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500 font-medium">Rendering Design...</p>
          </div>
        ) : concept.imageUrl ? (
          <>
            <img 
              src={concept.imageUrl} 
              alt={concept.title} 
              className="w-full h-full object-contain mix-blend-multiply filter drop-shadow-sm transition-transform duration-500 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-end justify-end p-4 opacity-0 group-hover:opacity-100">
              <button 
                onClick={handleDownload}
                className="bg-white text-slate-700 p-2 rounded-full shadow-lg hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                title="Download Image"
              >
                <Download size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="text-slate-400 text-sm flex flex-col items-center text-center px-4">
            <RefreshCw size={24} className="mb-2 opacity-50" />
            <span>Image generation unavailable</span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-6 flex-1 flex flex-col gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-1">{concept.title}</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{concept.rationale}</p>
        </div>

        <div className="space-y-3 mt-auto pt-4 border-t border-slate-100">
            {/* Typography */}
            <div className="flex items-start gap-2 text-sm text-slate-600">
                <TypeIcon size={16} className="mt-0.5 text-indigo-500 shrink-0" />
                <span className="font-medium text-slate-700">Type:</span>
                <span>{concept.typographySuggestion}</span>
            </div>

            {/* Colors */}
            <div className="flex items-start gap-2">
                <Palette size={16} className="mt-0.5 text-indigo-500 shrink-0" />
                <div className="flex flex-wrap gap-2">
                {concept.colorPalette.map((color, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 bg-slate-50 rounded-full pr-2 border border-slate-200">
                        <span 
                            className="w-4 h-4 rounded-full border border-slate-200/50 shadow-sm" 
                            style={{ backgroundColor: color }} 
                        />
                        <span className="text-xs font-mono text-slate-500 uppercase">{color}</span>
                    </div>
                ))}
                </div>
            </div>
        </div>

        {/* Prompt details */}
        <div className="mt-2 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Image Prompt</span>
                <button 
                    onClick={handleCopyPrompt}
                    className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                    {copied ? 'Copied!' : <><Copy size={12} /> Copy</>}
                </button>
            </div>
            <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 line-clamp-2 hover:line-clamp-none transition-all cursor-help" title={concept.imagePrompt}>
                {concept.imagePrompt}
            </p>
        </div>
      </div>
    </div>
  );
};
