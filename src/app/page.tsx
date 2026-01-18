"use client";

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Activity } from 'lucide-react'
import type { RecordWithDetails } from '@/types'
import { CHARACTER_MAP } from '@/data/localization'

export default function Home() {
  const [recentRecords, setRecentRecords] = useState<RecordWithDetails[]>([])

  useEffect(() => {
    const fetchRecent = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('records')
        .select(`
          *,
          record_characters (
            *,
            character:characters(*)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(3)

      if (data) setRecentRecords(data as unknown as RecordWithDetails[])
    }
    fetchRecent()
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col justify-center">

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />

          <h1 className="text-7xl md:text-9xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/20 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] mb-4">
            TEYVAT<br />ARCHIVES
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 font-light tracking-widest uppercase mb-12">
            Record Your Journey
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex gap-6"
        >
          <Link href="/records" className="group relative px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 font-bold text-white tracking-wider flex items-center gap-2">
              VIEW ARCHIVES <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link href="/create" className="group px-8 py-4 bg-purple-600 hover:bg-purple-500 rounded-full transition-all duration-300 shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 flex items-center gap-2 font-bold text-white tracking-wider">
            <Sparkles className="w-4 h-4" /> NEW ENTRY
          </Link>
        </motion.div>
      </section>

      {/* Recent Activity */}
      <section className="px-4 pb-20 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center gap-3 mb-8 px-4"
        >
          <Activity className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white tracking-wide">RECENT SIGNALS</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentRecords.map((record, i) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + (i * 0.1) }}
            >
              <Link href={`/records/${record.id}`} className="block h-full">
                <div className="glass-card h-full p-6 hover:-translate-y-2 group relative overflow-hidden rounded-2xl">
                  <div className="absolute top-0 right-0 p-4 opacity-50 text-6xl font-black text-white/5 pointer-events-none group-hover:scale-150 transition-transform duration-500">
                    {(i + 1).toString().padStart(2, '0')}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors line-clamp-1">{record.title}</h3>
                  <p className="text-slate-400 text-sm mb-6 line-clamp-2">{record.description || 'No description provided.'}</p>

                  <div className="flex items-center justify-between mt-auto border-t border-white/5 pt-4">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">{new Date(record.created_at).toLocaleDateString()}</span>
                    <div className="flex -space-x-2">
                      {(record.characters || []).slice(0, 4).map((rc, idx) => (
                        <div key={idx} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] items-center text-slate-400 overflow-hidden">
                          {rc.character?.name?.charAt(0)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
