"use client";

import { RecordWithDetails } from "@/types";
import { CHARACTER_MAP } from "@/data/localization";
import IconMap from "@/data/character_data.json";
import { motion } from "framer-motion";
import Link from "next/link";
import { PlayCircle, User, Swords } from "lucide-react";

type Props = {
    record: RecordWithDetails;
    rank: number;
};

export function RecordRow({ record, rank }: Props) {
    // 全パーティメンバー（4人まで）
    // party_ids がある場合はそれを使用、なければ characters から取得
    const partyNames = record.party_ids || record.characters?.map(c => c.character?.name) || [];

    // メインアタッカー判定
    const mainAttackerNames = record.main_attacker_ids ||
        record.characters?.filter(c => c.role === 'Main DPS').map(c => c.character?.name) || [];

    // Format time (ms -> hh:mm:ss)
    const formatTime = (ms: number | undefined) => {
        if (!ms) return "--:--:--";
        const hours = Math.floor(ms / 3600000);
        const min = Math.floor((ms % 3600000) / 60000);
        const sec = Math.floor((ms % 60000) / 1000);
        return `${hours.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    // アイコン取得
    const getCharIcon = (name: string | null | undefined) => {
        if (!name) return null;
        const iconName = (IconMap as Record<string, string>)[name];
        return iconName ? `https://enka.network/ui/${iconName}.png` : null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.08)" }}
            className="group flex flex-col md:flex-row items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm transition-all mb-3 hover:border-white/10"
        >
            {/* Rank */}
            <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full font-black text-xl italic
        ${rank === 1 ? 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/20' :
                    rank === 2 ? 'text-slate-300 bg-slate-500/10 border border-slate-500/20' :
                        rank === 3 ? 'text-amber-600 bg-amber-600/10 border border-amber-600/20' : 'text-slate-500'}`}
            >
                {rank}
            </div>

            {/* Party Members (All 4) */}
            <div className="flex gap-2 justify-center">
                {partyNames.slice(0, 4).map((name, idx) => {
                    const iconUrl = getCharIcon(name);
                    const isMainAttacker = mainAttackerNames.includes(name);
                    const charNameJp = name ? CHARACTER_MAP[name] || name : '';

                    return (
                        <div
                            key={idx}
                            className={`relative w-12 h-12
                                ${isMainAttacker ? 'z-20' : 'z-10'}
                                hover:z-30 hover:scale-110 transition-transform cursor-help`}
                            title={charNameJp}
                        >
                            <div className={`w-full h-full rounded-full border-2 bg-slate-800 overflow-hidden shadow-lg
                                ${isMainAttacker ? 'border-yellow-400' : 'border-slate-700'}`}>
                                {iconUrl ? (
                                    <img src={iconUrl} alt={name || ''} className="w-full h-full object-cover scale-125 -translate-y-2" />
                                ) : (
                                    <span className="flex items-center justify-center h-full text-white text-xs">
                                        {name?.charAt(0) || '?'}
                                    </span>
                                )}
                            </div>
                            {/* メインアタッカーバッジ */}
                            {isMainAttacker && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center shadow-xl border border-white/30 z-30">
                                    <Swords className="w-3 h-3 text-white" />
                                </div>
                            )}
                        </div>
                    );
                })}
                {/* 空枠を埋める */}
                {partyNames.length < 4 && [...Array(4 - partyNames.length)].map((_, idx) => (
                    <div
                        key={`empty-${idx}`}
                        className="w-12 h-12 rounded-full border-2 border-dashed border-slate-700 bg-slate-800/50 flex items-center justify-center"
                    >
                        <span className="text-slate-600 text-xs">?</span>
                    </div>
                ))}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left min-w-0 grid grid-cols-2 gap-4 items-center w-full">
                <div>
                    <div className="text-2xl font-bold font-mono text-white tracking-tighter">
                        {formatTime(record.time_ms)}
                    </div>
                    <div className="text-xs text-slate-500 uppercase flex items-center justify-center md:justify-start gap-1">
                        <PlayCircle className="w-3 h-3" /> クリアタイム
                    </div>
                    <div className="mt-1 flex justify-center md:justify-start">
                        {record.category_slug?.endsWith('Low') ? (
                            <span className="text-[10px] px-2 py-0.5 rounded border bg-blue-500/10 border-blue-500/30 text-blue-400 font-bold">
                                低凸
                            </span>
                        ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded border bg-yellow-500/10 border-yellow-500/30 text-yellow-500 font-bold">
                                制限なし
                            </span>
                        )}
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-center md:justify-start gap-2 text-slate-300 font-medium">
                        <User className="w-4 h-4 text-purple-400" />
                        {record.runner_name || 'Anonymous'}
                    </div>
                    <div className="text-xs text-slate-500">{record.platform || 'PC'}</div>
                </div>
            </div>

            {/* Actions */}
            <Link href={`/records/${record.id}`} className="w-full md:w-auto">
                <button className="w-full px-6 py-2 rounded-lg bg-white/5 hover:bg-purple-600 hover:text-white text-slate-400 text-sm font-bold border border-white/5 transition-all">
                    詳細
                </button>
            </Link>
        </motion.div >
    );
}
