import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { RecordWithDetails } from '@/types'
import { CHARACTER_MAP, ROLE_MAP } from '@/data/localization'
import IconMap from '@/data/character_data.json'
import WeaponMap from '@/data/weapon_full_data.json'
import { ArrowLeft, Clock, Calendar, User, Gamepad2, Share2 } from 'lucide-react'

const ELEMENT_COLORS: Record<string, { bg: string, border: string, accent: string }> = {
    Pyro: { bg: 'bg-red-500/10', border: 'border-red-500/20', accent: 'group-hover:border-red-500/50' },
    Hydro: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', accent: 'group-hover:border-blue-500/50' },
    Anemo: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', accent: 'group-hover:border-emerald-500/50' },
    Electro: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', accent: 'group-hover:border-purple-500/50' },
    Dendro: { bg: 'bg-green-500/10', border: 'border-green-500/20', accent: 'group-hover:border-green-500/50' },
    Cryo: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', accent: 'group-hover:border-cyan-500/50' },
    Geo: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', accent: 'group-hover:border-amber-500/50' },
};

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
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 text-purple-400 font-bold tracking-widest text-xs mb-4 uppercase">
                            <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300">
                                {typedRecord.category_slug || 'Unknown Category'}
                            </span>
                            <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-slate-400">
                                {typedRecord.platform || 'PC'}
                            </span>
                            <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-slate-400 font-mono">
                                {formatTime(typedRecord.time_ms)}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight drop-shadow-sm">
                            {typedRecord.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-slate-400">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                                <User className="w-4 h-4 text-purple-400" />
                                <span className="text-white font-bold">{typedRecord.runner_name || 'Anonymous'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(typedRecord.created_at).toLocaleDateString()} に記録</span>
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
                                const weaponData = (WeaponMap as any)[rc.weapon_name || ''] || null;
                                const weaponIconUrl = weaponData ? `https://enka.network/ui/${weaponData.icon}.png` : null;
                                const splashName = iconName.replace('UI_AvatarIcon_Side_', 'UI_Gacha_AvatarImg_');
                                const splashUrl = iconName ? `https://enka.network/ui/${splashName}.png` : null;
                                const element = rc.character?.element || 'None';
                                const colors = ELEMENT_COLORS[element] || { bg: 'bg-white/5', border: 'border-white/5', accent: 'hover:border-purple-500/30' };

                                return (
                                    <div key={rc.character_id} className={`group relative flex items-center gap-4 p-3 rounded-xl ${colors.bg} border ${colors.border} ${colors.accent} transition-all overflow-hidden`}>
                                        {/* Splash Art Background */}
                                        {splashUrl && (
                                            <div className="absolute inset-0 pointer-events-none opacity-[0.3] transition-opacity duration-300">
                                                <img
                                                    src={splashUrl}
                                                    alt=""
                                                    className="absolute -right-20 top-0 h-32 w-auto object-cover object-top scale-[1.5]"
                                                />
                                            </div>
                                        )}

                                        <div className="relative w-14 h-14 shrink-0">
                                            <div className={`
                                                relative z-10 w-full h-full rounded-full border-2 overflow-hidden bg-black/40 shadow-lg
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

                                            {/* Weapon Icon Overlay */}
                                            {(weaponIconUrl || rc.weapon_name) && (
                                                <div className="absolute -bottom-1 -right-1 z-30 w-9 h-9 rounded-full bg-slate-900 border border-white/40 overflow-hidden shadow-[0_0_10px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform flex items-center justify-center">
                                                    {weaponIconUrl ? (
                                                        <>
                                                            <img src={weaponIconUrl} alt={rc.weapon_name} className="w-full h-full object-contain p-1" />
                                                            <div className="absolute inset-x-0 bottom-0.5 flex items-center justify-center pointer-events-none">
                                                                <span className="text-[10px] font-bold text-amber-400 drop-shadow-[0_2px_2px_rgba(0,0,0,1)] leading-none">
                                                                    R{rc.refinement || 1}
                                                                </span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span className="text-[10px] text-white font-bold bg-purple-600 w-full h-full flex items-center justify-center">
                                                            W
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 relative z-10 min-w-0">
                                            <div className="font-bold text-white group-hover:text-purple-300 transition-colors truncate text-lg">
                                                {CHARACTER_MAP[rc.character?.name || ''] || rc.character?.name}
                                            </div>
                                            {(weaponData || rc.weapon_name) && (
                                                <div className="text-[11px] text-slate-400 font-medium truncate mb-1">
                                                    {weaponData?.nameJp || rc.weapon_name}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-xs text-slate-400 whitespace-nowrap">
                                                <span className="bg-black/40 px-1.5 py-0.5 rounded text-white font-mono">{rc.constellation || 0}凸</span>
                                                <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5">{rc.role || 'Member'}</span>
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

