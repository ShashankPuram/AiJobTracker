import { useState, useRef } from "react";
import { UploadCloud, File, CheckCircle, Loader2, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

interface UploadResponse {
  message?: string;
  extractedTextLength?: number;
  extractedSkillsMock?: string[];
  originalFileName?: string;
  error?: string;
}

export default function ResumeUpload() {
  const [isHovering, setIsHovering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const email = useAuthStore.getState().userEmail;
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/resume/upload`, {
        method: "POST",
        headers: email ? { "x-user-email": email } : {},
        body: formData,
      });
      const data = await res.json();
      if (data.error) {
        setResult({ error: data.error });
      } else {
        setResult(data);
        // Unlock Job Feed!
        useAuthStore.getState().setHasResume(true);
      }
    } catch (err) {
      console.error(err);
      setResult({ error: "Failed to upload resume to server. Ensure backend is running." });
    } finally {
      setIsUploading(false);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files[0]);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
    setIsHovering(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col items-center justify-center pt-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-3">Optimize Your Job Matches</h1>
        <p className="text-[#A1A1AA] max-w-lg mx-auto">
          Upload your resume and let AI JobTracker analyze your skills, experience, and timeline to find your perfect role.
        </p>
      </div>

      {!result && !isUploading ? (
        <div 
          className={`w-full max-w-2xl border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer ${
            isHovering ? 'border-[#EF4444] bg-[#EF4444]/10' : 'border-[#1F1F1F] bg-[#121212] hover:border-[#EF4444] hover:bg-[#1A1A1A]'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
          onDragLeave={() => setIsHovering(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".pdf,.doc,.docx,.txt"
            onChange={onFileSelect}
          />
          <div className="w-20 h-20 bg-[#EF4444]/10 text-[#EF4444] rounded-full flex items-center justify-center mx-auto mb-6">
            <UploadCloud className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Drag & Drop your Resume</h3>
          <p className="text-[#A1A1AA] mb-6">Supports PDF, DOCX, or TXT (Max 5MB)</p>
          
          <button className="px-6 py-3 bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.25)] transition-all hover:scale-105 pointer-events-none">
            Browse Files
          </button>
        </div>
      ) : isUploading ? (
         <div className="w-full max-w-2xl border border-[#1F1F1F] rounded-3xl p-12 text-center bg-[#121212] flex flex-col items-center shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            <Loader2 className="w-12 h-12 text-[#EF4444] animate-spin mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Analyzing Resume...</h3>
            <p className="text-[#A1A1AA]">Extracting skills via LangChain simulation.</p>
         </div>
      ) : result?.error ? (
         <div className="w-full max-w-2xl bg-[#121212] border border-[#EF4444]/50 rounded-3xl p-8 text-center shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            <XCircle className="w-16 h-16 text-[#EF4444] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Upload Failed</h3>
            <p className="text-[#EF4444] mb-6">{result.error}</p>
            <button 
               className="px-6 py-3 bg-[#1A1A1A] border border-[#1F1F1F] hover:bg-[#222] text-white font-semibold rounded-xl transition-all"
               onClick={() => setResult(null)}
            >
              Try Again
            </button>
         </div>
      ) : (
        <div className="w-full max-w-2xl bg-[#121212] border border-[#1F1F1F] rounded-3xl p-8 text-center shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-300">
           <div className="w-20 h-20 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Resume Analyzed!</h3>
          <p className="text-[#A1A1AA] mb-6">AI JobTracker extracted {result?.extractedSkillsMock?.length || 0} core skills from {result?.extractedTextLength} characters.</p>
          
          <div className="bg-[#1A1A1A] p-4 rounded-xl flex items-center gap-4 text-left max-w-md mx-auto mb-8 border border-[#1F1F1F]">
            <div className="w-12 h-12 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] flex items-center justify-center rounded-lg">
              <File className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold text-white truncate max-w-[200px]">{result?.originalFileName || "resume.pdf"}</div>
              <div className="text-sm text-[#A1A1AA] line-clamp-1">Extracted Skills: {result?.extractedSkillsMock?.join(", ")}</div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button 
               className="px-6 py-3 bg-[#1A1A1A] border border-[#1F1F1F] hover:bg-[#222] text-[#A1A1AA] hover:text-white font-semibold rounded-xl transition-all"
               onClick={() => setResult(null)}
            >
              Upload Another
            </button>
            <Link 
               to="/"
               className="px-6 py-3 bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.25)] transition-all flex items-center gap-2 hover:-translate-y-0.5"
            >
              View Jobs Feed 🚀
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
