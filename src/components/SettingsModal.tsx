import { useState, useEffect } from "react";
import { X, Save, Settings } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [model, setModel] = useState("gemini-1.5-flash");
  const [systemPrompt, setSystemPrompt] = useState("You are IR one, a helpful and modern AI chatbot similar to ChatGPT. You assist users with answering questions, writing code, and analyzing files.");

  useEffect(() => {
    if (isOpen) {
      const savedModel = localStorage.getItem("ir-model");
      const savedPrompt = localStorage.getItem("ir-system-prompt");
      if (savedModel) setModel(savedModel);
      if (savedPrompt) setSystemPrompt(savedPrompt);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem("ir-model", model);
    localStorage.setItem("ir-system-prompt", systemPrompt);
    // Dispatch custom event so other components know settings changed
    window.dispatchEvent(new Event('settings-updated'));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="w-full max-w-md bg-bg-secondary border border-border-theme rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        style={{
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5), var(--neon-shadow)'
        }}
      >
        <div className="flex items-center justify-between p-4 border-b border-border-theme bg-bg-tertiary">
          <div className="flex items-center gap-2 text-text-primary font-semibold">
            <Settings size={18} className="text-accent" />
            Chat Settings
          </div>
          <button 
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary block">
              AI Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-bg-primary border border-border-theme rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            >
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Smart)</option>
            </select>
            <p className="text-xs text-text-muted">
              Select which Google Gemini model the chatbot will use.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary block">
              Custom Personality (System Prompt)
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={4}
              className="w-full bg-bg-primary border border-border-theme rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none"
              placeholder="How should the AI behave?"
            />
            <p className="text-xs text-text-muted">
              Define the rules, tone, and personality the AI should follow.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-border-theme bg-bg-tertiary flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg shadow-md flex items-center gap-2 transition-all"
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
