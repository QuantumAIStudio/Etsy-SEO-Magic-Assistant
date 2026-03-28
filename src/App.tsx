/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Tag, 
  FileText, 
  Type, 
  Image as ImageIcon,
  Loader2,
  Store,
  ArrowRight,
  Palette,
  Moon,
  Sun,
  Leaf,
  Crown,
  Zap,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateSEOData } from './services/aiService';

const THEMES = [
  { id: 'etsy', name: 'Etsy Classic', icon: Store, color: '#F27D26' },
  { id: 'midnight', name: 'Midnight', icon: Moon, color: '#38BDF8' },
  { id: 'sage', name: 'Sage Organic', icon: Leaf, color: '#5A5A40' },
  { id: 'royal', name: 'Royal Luxury', icon: Crown, color: '#1E3A8A' },
  { id: 'minimal', name: 'Minimalist', icon: Zap, color: '#171717' },
];

const LegalModal = ({ isOpen, onClose, title, content }: { isOpen: boolean, onClose: () => void, title: string, content: React.ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <div key="modal-overlay" className="fixed inset-0 z-[100] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        >
          <div className="p-8 border-b border-[var(--theme-border)] flex items-center justify-between sticky top-0 bg-[var(--theme-card)] z-10">
            <h3 className="text-2xl font-bold font-display">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--theme-accent)] rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-8 overflow-y-auto custom-scrollbar">
            <div className="prose prose-sm max-w-none text-[var(--theme-text)] leading-relaxed space-y-4">
              {content}
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default function App() {
  const [theme, setTheme] = useState('etsy');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);
  const [formData, setFormData] = useState({
    productName: '',
    productDescription: '',
    targetAudience: '',
    style: '',
    storeName: ''
  });

  const [error, setError] = useState<string | null>(null);

  const toggleTheme = (themeId: string) => {
    setTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await generateSEOData(formData);
      setResult(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate SEO data';
      setError(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] font-sans selection:bg-[var(--theme-primary)]/20 transition-colors duration-500">
      {/* Header */}
      <header className="border-b border-[var(--theme-border)] bg-[var(--theme-card)] sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="bg-[var(--theme-primary)] p-2.5 rounded-xl shadow-lg shadow-[var(--theme-primary)]/20"
            >
              <Store className="text-white w-5 h-5" />
            </motion.div>
            <h1 className="text-xl font-bold tracking-tight font-display">Etsy SEO Magic</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1 bg-[var(--theme-bg)] p-1 rounded-full border border-[var(--theme-border)]">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => toggleTheme(t.id)}
                  className={`p-2 rounded-full transition-all relative group ${theme === t.id ? 'bg-[var(--theme-card)] shadow-sm' : 'hover:bg-[var(--theme-card)]/50'}`}
                  title={t.name}
                >
                  <t.icon className={`w-4 h-4 ${theme === t.id ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-text-muted)]'}`} />
                  {theme === t.id && (
                    <motion.div 
                      layoutId="theme-active"
                      className="absolute inset-0 rounded-full border-2 border-[var(--theme-primary)]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              ))}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--theme-text-muted)] bg-[var(--theme-accent)] px-3 py-1.5 rounded-full border border-[var(--theme-primary)]/10">
              Pro Assistant
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-[420px_1fr] gap-16 items-start">
          
          {/* Form Section */}
          <section className="space-y-10">
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--theme-accent)] text-[var(--theme-primary)] text-xs font-bold uppercase tracking-wider"
              >
                <Sparkles className="w-3 h-3" />
                AI-Powered Optimisation
              </motion.div>
              <h2 className="text-4xl font-bold leading-[1.1] tracking-tight font-display">
                Optimise your <span className="text-[var(--theme-primary)] italic font-serif font-normal">Etsy Listing</span> in seconds.
              </h2>
              <p className="text-[var(--theme-text-muted)] text-base leading-relaxed">
                Fill in your product details and let our AI handle the SEO heavy lifting.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--theme-text-muted)] ml-1">Product Name</label>
                  <input 
                    required
                    placeholder="e.g. Personalized Wooden Music Box"
                    className="w-full px-5 py-4 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--theme-primary)]/10 focus:border-[var(--theme-primary)] transition-all text-sm shadow-sm"
                    value={formData.productName}
                    onChange={e => setFormData({...formData, productName: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--theme-text-muted)] ml-1">Store Name (Optional)</label>
                  <input 
                    placeholder="e.g. ArtisanCrafts"
                    className="w-full px-5 py-4 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--theme-primary)]/10 focus:border-[var(--theme-primary)] transition-all text-sm shadow-sm"
                    value={formData.storeName}
                    onChange={e => setFormData({...formData, storeName: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--theme-text-muted)] ml-1">Brief Description</label>
                  <textarea 
                    required
                    placeholder="What makes it special? Mention materials, use cases..."
                    rows={4}
                    className="w-full px-5 py-4 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--theme-primary)]/10 focus:border-[var(--theme-primary)] transition-all text-sm shadow-sm resize-none"
                    value={formData.productDescription}
                    onChange={e => setFormData({...formData, productDescription: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--theme-text-muted)] ml-1">Target Audience</label>
                    <input 
                      placeholder="e.g. New Parents"
                      className="w-full px-5 py-4 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--theme-primary)]/10 focus:border-[var(--theme-primary)] transition-all text-sm shadow-sm"
                      value={formData.targetAudience}
                      onChange={e => setFormData({...formData, targetAudience: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--theme-text-muted)] ml-1">Style / Vibe</label>
                    <input 
                      placeholder="e.g. Minimalist, Boho"
                      className="w-full px-5 py-4 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--theme-primary)]/10 focus:border-[var(--theme-primary)] transition-all text-sm shadow-sm"
                      value={formData.style}
                      onChange={e => setFormData({...formData, style: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--theme-primary)] text-white py-5 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[var(--theme-primary-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-[var(--theme-primary)]/20 group"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Generate SEO Magic
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>
          </section>

          {/* Results Section */}
          <section className="min-h-[600px] relative">
            <AnimatePresence mode="wait">
              {!result && !loading && (
                <motion.div 
                  key="initial-state"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-[var(--theme-border)] rounded-[2.5rem] bg-[var(--theme-card)]/30 backdrop-blur-sm"
                >
                  <motion.div 
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="bg-[var(--theme-bg)] p-8 rounded-full mb-8 shadow-inner"
                  >
                    <Sparkles className="w-16 h-16 text-[var(--theme-primary)] opacity-30" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-3 font-display">Ready to shine?</h3>
                  <p className="text-[var(--theme-text-muted)] max-w-xs text-sm leading-relaxed">
                    Your optimised listing content will appear here once generated. We'll handle the titles, tags, and descriptions.
                  </p>
                </motion.div>
              )}

              {loading && (
                <motion.div 
                  key="loading-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--theme-bg)]/80 backdrop-blur-md z-20 rounded-[2.5rem]"
                >
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-16 h-16 text-[var(--theme-primary)]" />
                    </motion.div>
                    <div className="absolute inset-0 blur-2xl bg-[var(--theme-primary)]/30 animate-pulse rounded-full" />
                  </div>
                  <p className="mt-8 font-bold text-sm uppercase tracking-widest text-[var(--theme-text-muted)] animate-pulse">Analyzing Etsy trends...</p>
                </motion.div>
              )}

              {error && (
                <motion.div 
                  key="error-state"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl text-red-500 space-y-4"
                >
                  <div className="flex items-center gap-3 font-bold uppercase tracking-wider text-sm">
                    <span className="bg-red-500 text-white p-1.5 rounded-lg">
                      <Zap className="w-4 h-4" />
                    </span>
                    Connection Issue
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium leading-relaxed">{error}</p>
                    <p className="text-xs opacity-60 italic">Check the browser console for more details.</p>
                  </div>
                  <button 
                    onClick={() => setError(null)}
                    className="text-[10px] font-black uppercase tracking-widest px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                  >
                    Try Again
                  </button>
                </motion.div>
              )}

              {result && (
                <motion.div 
                  key="result-state"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold font-display">Generated Content</h3>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyToClipboard(result, 'all')}
                      className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-primary)] bg-[var(--theme-accent)] px-4 py-2 rounded-full flex items-center gap-2 hover:opacity-80 transition-opacity border border-[var(--theme-primary)]/10"
                    >
                      {copiedField === 'all' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedField === 'all' ? 'Copied All' : 'Copy All'}
                    </motion.button>
                  </div>

                  <div className="grid gap-8">
                    {/* Result Card */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-[2rem] p-8 shadow-xl shadow-black/5 hover:shadow-2xl transition-all relative group"
                    >
                      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <FileText className="w-5 h-5 text-[var(--theme-text-muted)]" />
                      </div>
                      <div className="prose prose-sm max-w-none text-[var(--theme-text)] whitespace-pre-wrap leading-relaxed font-medium">
                        {result}
                      </div>
                    </motion.div>
                  </div>

                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[var(--theme-primary)] text-white p-8 rounded-[2rem] flex items-center justify-between shadow-2xl shadow-[var(--theme-primary)]/30 overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                    <div className="flex items-center gap-6 relative z-10">
                      <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
                        <Sparkles className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-bold">SEO Optimised & Ready</p>
                        <p className="text-sm text-white/70">Copy and paste directly into your Etsy listing.</p>
                      </div>
                    </div>
                    <Store className="w-12 h-12 opacity-20 relative z-10" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--theme-border)] mt-24 py-16 bg-[var(--theme-card)]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3 opacity-60">
            <Store className="w-5 h-5 text-[var(--theme-primary)]" />
            <span className="text-sm font-black uppercase tracking-widest font-display">Etsy SEO Magic</span>
          </div>
          <p className="text-xs text-[var(--theme-text-muted)] font-medium">© 2026 Etsy SEO Magic. Built for professional sellers.</p>
          <div className="flex gap-8">
            <button 
              onClick={() => setActiveModal('privacy')}
              className="text-xs font-bold uppercase tracking-widest text-[var(--theme-text-muted)] hover:text-[var(--theme-primary)] transition-colors"
            >
              Privacy
            </button>
            <button 
              onClick={() => setActiveModal('terms')}
              className="text-xs font-bold uppercase tracking-widest text-[var(--theme-text-muted)] hover:text-[var(--theme-primary)] transition-colors"
            >
              Terms
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LegalModal
        isOpen={activeModal === 'privacy'}
        onClose={() => setActiveModal(null)}
        title="Privacy Policy"
        content={
          <>
            <p><strong>Last Updated: March 28, 2026</strong></p>
            <p>At Etsy SEO Magic Assistant, we value your privacy. This policy outlines how we handle your data.</p>
            <h4 className="font-bold text-lg mt-4">1. Data Collection</h4>
            <p>We do not store your product descriptions or personal data on our servers. All information you enter is sent directly to the AI processing worker to generate your SEO content.</p>
            <h4 className="font-bold text-lg mt-4">2. AI Processing</h4>
            <p>Your data is processed using Cloudflare AI models. By using this service, you agree to the processing of your input data for the purpose of generating SEO content.</p>
            <h4 className="font-bold text-lg mt-4">3. Local Storage</h4>
            <p>We may use local storage in your browser to remember your theme preferences and recent form inputs for your convenience.</p>
            <h4 className="font-bold text-lg mt-4">4. Third-Party Links</h4>
            <p>Our service may contain links to Etsy. We are not responsible for the privacy practices of external sites.</p>
          </>
        }
      />

      <LegalModal
        isOpen={activeModal === 'terms'}
        onClose={() => setActiveModal(null)}
        title="Terms of Service"
        content={
          <>
            <p><strong>Last Updated: March 28, 2026</strong></p>
            <p>By using Etsy SEO Magic Assistant, you agree to the following terms.</p>
            <h4 className="font-bold text-lg mt-4">1. Use of Service</h4>
            <p>This tool is provided for professional Etsy sellers to assist with SEO optimisation. You are responsible for the final content you publish on your Etsy store.</p>
            <h4 className="font-bold text-lg mt-4">2. AI Generated Content</h4>
            <p>The content is generated by AI. While we strive for high quality, we do not guarantee specific sales results or search rankings. Always review and edit AI-generated content before use.</p>
            <h4 className="font-bold text-lg mt-4">3. Intellectual Property</h4>
            <p>You retain all rights to the product information you provide. You are granted a license to use the generated SEO content for your commercial purposes.</p>
            <h4 className="font-bold text-lg mt-4">4. Limitation of Liability</h4>
            <p>Etsy SEO Magic Assistant is not liable for any account suspensions, loss of revenue, or ranking changes on the Etsy platform resulting from the use of this tool.</p>
          </>
        }
      />
    </div>
  );
}
