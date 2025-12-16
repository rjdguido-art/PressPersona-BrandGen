import React, { useState, useEffect } from 'react';
import { generateLogoConcepts, generateLogoImage } from './services/geminiService';
import { LogoConcept, FormData } from './types';
import { LogoConceptCard } from './components/LogoConceptCard';
import { Sparkles, PenTool, Loader2, ArrowRight, LayoutGrid } from 'lucide-react';

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    companyName: 'PressPersona',
    description: 'A modern digital PR and brand identity agency helping tech startups find their voice.',
    industry: 'Public Relations & Branding'
  });

  const [concepts, setConcepts] = useState<LogoConcept[]>([]);
  const [isGeneratingConcepts, setIsGeneratingConcepts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Main generation handler
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim()) return;

    setError(null);
    setConcepts([]);
    setIsGeneratingConcepts(true);

    try {
      // Step 1: Generate Text Concepts
      const initialConcepts = await generateLogoConcepts(
        formData.companyName,
        formData.description,
        formData.industry
      );
      setConcepts(initialConcepts);
      setIsGeneratingConcepts(false); // Stop main loader, start individual image loaders

      // Step 2: Generate Images in parallel for each concept
      // We update the state as each image arrives
      initialConcepts.forEach(async (concept) => {
        const imageUrl = await generateLogoImage(concept.imagePrompt);
        
        setConcepts(prevConcepts => 
          prevConcepts.map(c => 
            c.id === concept.id 
              ? { ...c, imageUrl: imageUrl || undefined, isLoadingImage: false } 
              : c
          )
        );
      });

    } catch (err: any) {
      console.error(err);
      setError("We encountered an issue generating your brand concepts. Please try again.");
      setIsGeneratingConcepts(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
               <PenTool size={18} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              BrandGen
            </h1>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            Powered by Gemini 2.5 Flash
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Input Form */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="text-indigo-500" size={20} />
                Identity Details
              </h2>
              
              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none"
                    placeholder="e.g. PressPersona"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
                  <input
                    type="text"
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none"
                    placeholder="e.g. Technology"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none resize-none"
                    placeholder="What does your company do?"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGeneratingConcepts}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {isGeneratingConcepts ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Thinking...
                    </>
                  ) : (
                    <>
                      Generate Concepts
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8 xl:col-span-9">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-start gap-3">
                <div className="mt-0.5 text-xl">⚠️</div>
                <p>{error}</p>
              </div>
            )}

            {!isGeneratingConcepts && concepts.length === 0 && !error && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                <LayoutGrid size={48} className="mb-4 text-slate-300" />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">Ready to Design</h3>
                <p className="max-w-md">Enter your company details on the left to generate unique AI-powered logo concepts and visual identities.</p>
              </div>
            )}

            {isGeneratingConcepts && concepts.length === 0 && (
               <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-2">Analyzing Brand Identity...</h3>
                  <p className="text-slate-500 max-w-sm">Gemini is brainstorming concepts for "{formData.companyName}" based on your description.</p>
               </div>
            )}

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {concepts.map((concept) => (
                <LogoConceptCard key={concept.id} concept={concept} />
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;