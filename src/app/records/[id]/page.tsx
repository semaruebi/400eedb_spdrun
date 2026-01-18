import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { RecordWithDetails } from '@/types'
import { CHARACTER_MAP, ROLE_MAP } from '@/data/localization'
import IconMap from '@/data/character_data.json'
import { ArrowLeft, Clock, Calendar, User, Gamepad2, Share2 } from 'lucide-react'

type Props = {
    params: Promise<{ id: string }>
}

export default async function RecordDetailPage({ params }: Props) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch record with characters
    const { data: record, error } = await supabase
        .from('records')
        .select(`
      *,
      record_characters (
        *,
        character:characters(*)
      )
    `)
        .eq('id', id)
        .single()

    if (error || !record) {
        console.error('Error fetching record:', error)
        return notFound()
    }

    const typedRecord = record as unknown as RecordWithDetails
    const characters = typedRecord.record_characters || []

    // Format time (ms -> hh:mm:ss)
    const formatTime = (ms: number | undefined) => {
        if (!ms) return "--:--:--";
        const hours = Math.floor(ms / 3600000);
        const min = Math.floor((ms % 3600000) / 60000);
        const sec = Math.floor((ms % 60000) / 1000);
        return `${hours.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    return (
        <div className="container mx-auto max-w-5xl py-12 px-4 pb-32">

            {/* Header */}
            <div className="mb-12">
                <Link href="/records" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all mb-8 group border border-white/5">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold text-sm">一覧に戻る</span>
                </Link>

                <div className="flex flex-col md:flex-row gap-8 items-start md:items-end justify-between">
                    <div>
                        <div className="flex items-center gap-3 text-purple-400 font-bold tracking-widest text-sm mb-2 uppercase">
                            <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded">{typedRecord.category_slug || 'Unknown Category'}</span>
                            <span className="text-slate-500">•</span>
                            <span>{typedRecord.platform || 'PC'}</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-cinzel font-bold text-white mb-4 tracking-tight drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                            {formatTime(typedRecord.time_ms) || typedRecord.title}
                        </h1>
                        <div className="flex items-center gap-6 text-slate-400">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span className="text-white font-bold">{typedRecord.runner_name || 'Anonymous'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(typedRecord.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Share / Actions (Mock) */}
                    <button className="p-3 rounded-full bg-white/5 hover:bg-purple-600/20 border border-white/10 hover:border-purple-500/50 transition-all text-slate-400 hover:text-white">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Video */}
                    {typedRecord.video_url ? (
                        <div className="glass-panel p-1 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
                            <div className="aspect-video bg-black rounded-xl overflow-hidden relative">
                                {/* Embed logic would go here, for now simpler link/cover */}
                                <iframe
                                    src={typedRecord.video_url.replace('watch?v=', 'embed/')}
                                    className="w-full h-full"
                                    allowFullScreen
                                    title="Run Video"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="glass-panel p-12 rounded-2xl border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <Gamepad2 className="w-8 h-8 opacity-50" />
                            </div>
                            <p>リプレイ動画がありません</p>
                        </div>
                    )}

                    {/* Metadata / Notes */}
                    <div className="glass p-8 rounded-2xl border-white/5">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">メモ・備考</h3>
                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {typedRecord.description || 'メモはありません。'}
                        </p>
                    </div>
                </div>

                {/* Sidebar: Party */}
                <div className="space-y-6">
                    <div className="glass-panel p-6 rounded-2xl border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <span>⚔️</span> パーティ構成
                        </h3>

                        <div className="space-y-4">
                            {characters.map((rc) => {
                                const iconName = (IconMap as any)[rc.character?.name || ''] || '';
                                const iconUrl = iconName ? `https://enka.network/ui/${iconName}.png` : null;
                                const splashName = iconName.replace('UI_AvatarIcon_Side_', 'UI_Gacha_AvatarImg_');
                                const splashUrl = iconName ? `https://enka.network/ui/${splashName}.png` : null;

                                return (
                                    <div key={rc.character_id} className="group relative flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/30 transition-all overflow-hidden">
                                        {/* Splash Art Background */}
                                        {splashUrl && (
                                            <div className="absolute inset-0 pointer-events-none opacity-[0.5] transition-opacity duration-300">
                                                <img
                                                    src={splashUrl}
                                                    alt=""
                                                    className="absolute -right-18 top-0 h-32 w-auto object-cover object-top scale-[1.5]"
                                                />
                                            </div>
                                        )}

                                        <div className={`
                                            relative z-10 w-14 h-14 rounded-full border-2 overflow-hidden bg-black/40 shadow-lg
                                            ${rc.character?.element === 'Pyro' ? 'border-red-500' :
                                                rc.character?.element === 'Hydro' ? 'border-blue-500' :
                                                    rc.character?.element === 'Cryo' ? 'border-cyan-500' :
                                                        rc.character?.element === 'Electro' ? 'border-purple-500' :
                                                            rc.character?.element === 'Anemo' ? 'border-emerald-500' :
                                                                rc.character?.element === 'Geo' ? 'border-yellow-500' :
                                                                    rc.character?.element === 'Dendro' ? 'border-green-500' : 'border-slate-600'}
                                         `}>
                                            {iconUrl ? (
                                                <img src={iconUrl} alt={rc.character?.name} className="w-full h-full object-cover scale-125 -translate-y-2" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs">{rc.character?.name[0]}</div>
                                            )}
                                        </div>

                                        <div className="flex-1 relative z-10">
                                            <div className="font-bold text-white group-hover:text-purple-300 transition-colors">
                                                {CHARACTER_MAP[rc.character?.name || ''] || rc.character?.name}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                                <span className="bg-black/30 px-1.5 py-0.5 rounded">{rc.constellation || 0}凸</span>
                                                <span>{rc.role || 'Member'}</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                            {characters.length === 0 && (
                                <p className="text-slate-500 text-sm text-center py-4">パーティデータがありません</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

