import { useState } from 'react'
import { Sparkles, Send, Video, Download, Clock, History, Menu, X } from 'lucide-react'

const BACKEND_URL = "https://xp-video-studio.vercel.app"

export default function App(){
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [videos, setVideos] = useState([])
  const [selected, setSelected] = useState(null)
  const [showHistory, setShowHistory] = useState(false)

  const generate = async () => {
    if(!prompt.trim()) return
    setLoading(true)
    const newPrompt = prompt
    setPrompt("")
    try{
      const res = await fetch(`${BACKEND_URL}/api/generate`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ prompt: newPrompt, duration: 8, aspectRatio: "16:9" })
      })
      const data = await res.json()
      const newVideo = { 
        id: Date.now(), 
        prompt: newPrompt, 
        url: data.videoUrl || data.url || data.video_url, 
        createdAt: new Date().toLocaleTimeString() 
      }
      setVideos(v => [newVideo, ...v])
      setSelected(newVideo)
    }catch(e){
      alert("Backend not ready yet. Check: "+ BACKEND_URL + "/api/generate\nError: "+ e.message)
      setPrompt(newPrompt)
    }finally{ setLoading(false) }
  }

  return (
    <div className="min-h-screen flex bg-[#0e0e10] text-white">
      {/* Sidebar - Gemini Style */}
      <div className={`${showHistory ? 'flex' : 'hidden'} md:flex w-[280px] bg-[#15151a] border-r border-white/10 flex-col fixed md:relative inset-y-0 left-0 z-50`}>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-[16px]">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-blue-500 rounded-lg flex items-center justify-center text-sm">XP</div> XP Video Studio
          </div>
          <button className="md:hidden p-1" onClick={()=>setShowHistory(false)}><X size={20}/></button>
        </div>

        <button onClick={()=>{setSelected(null); setShowHistory(false)}} className="mx-3 mt-2 bg-[#2a2a30] hover:bg-[#33333a] rounded-full py-2.5 px-4 flex items-center gap-2 text-sm transition">
          <Video size={16}/> New video
        </button>

        <div className="mt-6 px-4 text-[11px] text-white/30 uppercase tracking-widest flex items-center gap-2">
          <History size={12}/> Recent Videos
        </div>
        
        <div className="flex-1 overflow-y-auto mt-2 px-2 space-y-1">
          {videos.length===0 && <p className="p-3 text-sm text-white/30">No videos yet. Your generated videos will appear here like Gemini history.</p>}
          {videos.map(v=>(
            <div key={v.id} onClick={()=>{setSelected(v); setShowHistory(false)}} className={`p-3 rounded-xl cursor-pointer hover:bg-white/5 ${selected?.id===v.id?'bg-white/10':''}`}>
              <p className="text-[13px] truncate text-white/80">{v.prompt}</p>
              <p className="text-[11px] text-white/40 mt-1">{v.createdAt}</p>
            </div>
          ))}
        </div>
        <div className="p-3 text-[10px] text-white/20 border-t border-white/5">Model: Veo 3 • XP Labs</div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-14 border-b border-white/10 flex items-center px-4 justify-between bg-[#0e0e10]/80 backdrop-blur sticky top-0">
          <button className="md:hidden" onClick={()=>setShowHistory(true)}><Menu/></button>
          <div className="text-xs text-white/50 flex items-center gap-2"><Sparkles size={12} className="text-violet-400"/> Gemini-inspired • Veo Model</div>
          <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-blue-500 rounded-full"/>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!selected ? (
            <div className="max-w-3xl mx-auto pt-16 md:pt-28 px-6 text-center">
              <h1 className="text-[32px] md:text-[52px] font-[400] tracking-tight leading-[1.1] bg-gradient-to-r from-[#a5b4fc] via-[#93c5fd] to-[#67e8f9] bg-clip-text text-transparent">
                What video will you create today?
              </h1>
              <p className="mt-4 text-white/40 text-sm">Gemini-style video generation powered by Google Veo</p>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
                {[
                  "Cinematic drone shot over Tokyo at night, neon lights reflecting on wet streets, 8s",
                  "Cute fluffy cat astronaut floating in zero gravity, Pixar style, adorable",
                  "Luxury watch product ad, slow motion rotation, black studio background, 4k"
                ].map((ex,i)=>(
                  <div key={i} onClick={()=>setPrompt(ex)} className="p-4 rounded-2xl bg-white/[0.06] border border-white/10 hover:bg-white/[0.08] cursor-pointer text-[13px] leading-5 text-white/60 transition">
                    {ex}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto p-4 md:p-8">
              <div className="rounded-[24px] bg-[#1c1c20] border border-white/10 p-4 md:p-5">
                <p className="text-[12px] text-white/50 mb-3 flex items-center gap-2"><Clock size={12}/>{selected.createdAt} • {selected.prompt}</p>
                {selected.url ? (
                  <video src={selected.url} controls autoPlay loop className="w-full rounded-[16px] bg-black aspect-video object-cover"/>
                ) : (
                  <div className="aspect-video rounded-[16px] bg-black flex items-center justify-center flex-col gap-3">
                    <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"/>
                    <p className="text-white/40 text-xs">Generating with Veo... 30-60 seconds</p>
                  </div>
                )}
                {selected.url && (
                  <div className="mt-4 flex gap-2">
                    <a href={selected.url} download target="_blank" className="bg-white text-black rounded-full px-5 py-2 text-sm font-medium flex items-center gap-2 hover:bg-white/90">
                      <Download size={16}/> Download Video
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Prompt Input - Gemini Style */}
        <div className="p-3 md:p-6 bg-gradient-to-t from-[#0e0e10] to-transparent">
          <div className="max-w-3xl mx-auto">
            <div className="bg-[#1e1e22] border border-white/20 rounded-[28px] p-2 flex items-end gap-2 shadow-[0_0_40px_rgba(139,92,246,0.15)] focus-within:border-violet-500/50 transition">
              <textarea 
                value={prompt} 
                onChange={e=>setPrompt(e.target.value)} 
                onKeyDown={e=>{if(e.key==='Enter' && !e.shiftKey){e.preventDefault(); generate()}}}
                placeholder="Describe the video you want to create..." 
                rows={1}
                className="flex-1 bg-transparent resize-none outline-none p-3 text-[15px] placeholder:text-white/30 max-h-32"
              />
              <button onClick={generate} disabled={loading || !prompt.trim()} className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center disabled:opacity-30 hover:bg-white/90 transition shrink-0">
                {loading ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"/> : <Send size={18}/>}
              </button>
            </div>
            <p className="text-center text-[10px] text-white/20 mt-3 tracking-wide">XP Video Studio can make mistakes. Verify important info. Backend: {BACKEND_URL}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
