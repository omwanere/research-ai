"use client";

import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/search?query=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const hasResults = results.length > 0;

  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      <div 
        className={`max-w-4xl mx-auto px-6 transition-all duration-700 ease-in-out flex flex-col ${
          hasResults ? "pt-12" : "pt-[30vh]"
        }`}
      >
        <div className="flex flex-col items-center mb-10 w-full transition-all duration-700">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.4)]">
               <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
              Research AI
            </h1>
          </div>
          
          <form 
            onSubmit={search} 
            className="w-full relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-xl opacity-20 group-focus-within:opacity-40 transition-opacity duration-500"></div>
            <div className="relative flex items-center w-full bg-[#111111] border border-gray-800 focus-within:border-blue-500/50 rounded-2xl overflow-hidden transition-all duration-300 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <div className="pl-6 text-gray-400">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input
                className="w-full bg-transparent text-gray-100 p-5 md:p-6 text-lg md:text-xl outline-none placeholder:text-gray-600 font-light"
                placeholder="Ask a question or search for research..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="submit"
                disabled={isSearching || !query.trim()}
                className="mr-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 text-white p-3 md:px-8 md:py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center min-w-[120px]"
              >
                {isSearching ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  "Search"
                )}
              </button>
            </div>
          </form>
        </div>

        <div className={`w-full flex flex-col gap-6 pb-20 transition-all duration-700 ${hasResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none absolute hidden'}`}>
          {results.length > 0 && (
            <div className="text-gray-400 text-sm font-medium border-b border-gray-800 pb-2 mb-2">
              Found {results.length} relevant excerpt{results.length !== 1 && 's'}
            </div>
          )}
          
          {results.map((r, i) => (
            <div
              key={i}
              className="group bg-[#111] hover:bg-[#161616] border border-gray-800 hover:border-blue-500/30 p-6 md:p-8 rounded-2xl transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationFillMode: "both", animationDelay: `${i * 100}ms` }}
            >
              <div className="flex justify-between items-start">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20">
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  {r.chunk || "Document"}
                </div>
                <div className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  Score: {r.score?.toFixed(3)}
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed text-base md:text-lg">
                {r.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}