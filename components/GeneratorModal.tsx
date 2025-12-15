import React, { useState, useEffect } from 'react';
import { Heart, X, Loader2, Wind } from 'lucide-react';
import { ActivityCategory, CraftCategory } from '../types';
import { generateCraftImage } from '../services/agentService';

interface GeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (imageUrl: string, prompt: string, category: CraftCategory, structuredPrompt: any, seed: number) => void;
}

const LOADING_MESSAGES = [
  "Finding your moment of calm...",
  "Preparing your creative space...",
  "Breathing life into your vision...",
  "Crafting something peaceful...",
  "Let the creativity flow..."
];

export const GeneratorModal: React.FC<GeneratorModalProps> = ({ isOpen, onClose, onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState<ActivityCategory>(ActivityCategory.DRAWING);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setApiKeyMissing(true);
    }
  }, []);

  // Rotate loading messages
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingMsg(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;

    setIsLoading(true);

    try {
      const result = await generateCraftImage(prompt, category);
      onGenerate(result.imageUrl, prompt, category, result.structuredPrompt, result.seed);
      setPrompt('');
      onClose();
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to generate. Please ensure you have valid API keys configured.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative">

        {/* Header */}
        <div className="bg-slate-800/50 px-6 py-4 flex justify-between items-center border-b border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Heart className="text-emerald-400" />
            Begin Your Moment
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {apiKeyMissing && (
            <div className="bg-amber-900/20 border border-amber-800 text-amber-200 p-3 rounded text-sm">
              Note: Please configure your API keys in Settings for generation to work.
            </div>
          )}

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
                <Loader2 className="w-16 h-16 text-emerald-500 animate-spin relative z-10" />
              </div>
              <p className="text-lg font-medium text-emerald-200 animate-pulse">{loadingMsg}</p>
              <p className="text-sm text-slate-500">Take a deep breath...</p>
            </div>
          ) : (
            <form onSubmit={handleGenerate} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Choose Your Activity</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                >
                  {Object.values(ActivityCategory).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">What would you like to create?</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., A peaceful sunset over calm waters, a lotus mandala with soft gradients..."
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white h-32 resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Wind className="w-5 h-5" />
                Create My Moment
              </button>
            </form>
          )}
        </div>

        {/* Footer Note */}
        <div className="bg-slate-950/50 px-6 py-3 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500">Mindful creation powered by <span className="text-emerald-400 font-semibold">BRIA FIBO</span></p>
        </div>
      </div>
    </div>
  );
};
