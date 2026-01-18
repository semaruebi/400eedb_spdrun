"use client";

import { CHARACTER_MAP } from '@/data/localization'
import type { RecordWithDetails } from '@/types'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { PlayCircle, Calendar } from 'lucide-react'
import IconMap from '@/data/character_data.json'

type Props = {
    record: RecordWithDetails
}

export function RecordCard({ record }: Props) {
    return (
        <Link href={`/records/${record.id}`} className="block h-full">
            <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                className="glass-card rounded-2xl p-6 h-full flex flex-col relative overflow-hidden group border-white/5 bg-white/5"
            >
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-[60px] -mr-10 -mt-10 transition-all duration-500 group-hover:bg-purple-500/20 group-hover:w-56 group-hover:h-56"></div>

                <div className="relative z-10 flex flex-col h-full">
                    <h3 className="text-xl font-bold mb-3 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-pink-300 transition-all duration-300">
                        {record.title}
                    </h3>

                    <p className="text-slate-400 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">
                        {record.description || 'No description.'}
                    </p>

                    <div className="space-y-4 mt-auto">
                        <div className="flex -space-x-3 overflow-hidden py-1 pl-1">
                            {(record.characters || []).slice(0, 5).map((rc) => {
                                const iconName = (IconMap as any)[rc.character?.name || ''] || '';
                                const iconUrl = iconName ? `https://enka.network/ui/${iconName}.png` : null;

                                return (
                                    <div
                                        key={rc.character_id}
                                        className={`relative w-10 h-10 rounded-full border-2 border-[#1a1a2e] block overflow-hidden bg-slate-800
                                            ${rc.character?.element === 'Pyro' ? 'shadow-[0_0_10px_rgba(239,68,68,0.3)]' : ''}
                                            ${rc.character?.element === 'Hydro' ? 'shadow-[0_0_10px_rgba(59,130,246,0.3)]' : ''}
                                            ${rc.character?.element === 'Electro' ? 'shadow-[0_0_10px_rgba(168,85,247,0.3)]' : ''}
                                            ${rc.character?.element === 'Dendro' ? 'shadow-[0_0_10px_rgba(34,197,94,0.3)]' : ''}
                                        `}
                                        title={CHARACTER_MAP[rc.character?.name || ''] || rc.character?.name}
                                    >
                                        {iconUrl ? (
                                            <img src={iconUrl} alt={rc.character?.name} className="w-full h-full object-cover scale-110" loading="lazy" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-bold">
                                                {rc.character?.name?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                            {(record.characters?.length || 0) > 5 && (
                                <div className="w-10 h-10 rounded-full bg-black/50 border-2 border-[#1a1a2e] flex items-center justify-center text-xs text-white font-bold backdrop-blur-sm">
                                    +{(record.characters?.length || 0) - 5}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-white/5">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 opacity-70" />
                                {new Date(record.created_at).toLocaleDateString()}
                            </span>
                            {record.video_url && (
                                <span className="flex items-center gap-1.5 text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                                    <PlayCircle className="w-3.5 h-3.5" />
                                    <span>Replay</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    )
}

