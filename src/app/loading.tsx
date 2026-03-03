import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center bg-black min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 text-[#1d9aef] animate-spin opacity-80" />
        <span className="text-[12px] font-black text-zinc-500 uppercase tracking-widest animate-pulse">
          Tapestry
        </span>
      </div>
    </div>
  )
}
