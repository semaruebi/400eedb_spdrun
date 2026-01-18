"use client";

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, Crown, Swords, Shield, Heart, Move } from 'lucide-react';
import Link from 'next/link';
import CharacterFullData from '@/data/character_full_data.json';
import WeaponFullData from '@/data/weapon_full_data.json';
import { CHARACTER_MAP } from '@/data/localization';

// キャラデータ型
type CharacterData = { icon: string; weaponType: string; element: string; isStandard?: boolean; rarity?: number };
type WeaponData = { icon: string; nameJp: string; type: string; rarity: number; isStandard?: boolean };

// キャラリスト
const ALL_CHARACTERS = Object.entries(CharacterFullData as Record<string, CharacterData>)
    .map(([name, data]) => ({
        name,
        nameJp: CHARACTER_MAP[name] || name,
        icon: data.icon,
        weaponType: data.weaponType,
        isStandard: data.isStandard || false,
        rarity: data.rarity || 4, // デフォルト4
    }))
    .filter(c => CHARACTER_MAP[c.name]); // Only include characters with JP names

// 武器リスト（レア度順にソート）
const ALL_WEAPONS = Object.entries(WeaponFullData as Record<string, WeaponData>)
    .map(([name, data]) => ({
        name,
        nameJp: data.nameJp,
        icon: data.icon,
        type: data.type,
        rarity: data.rarity,
        isStandard: data.isStandard || false,
    }))
    .sort((a, b) => b.rarity - a.rarity); // 5星 → 4星の順

// ロールリスト
const ROLES = [
    { id: 'Main DPS', label: 'メイン火力', icon: Crown, color: 'text-yellow-400' },
    { id: 'Sub DPS', label: 'サブ火力', icon: Swords, color: 'text-orange-400' },
    { id: 'Support', label: 'サポート', icon: Shield, color: 'text-blue-400' },
    { id: 'Healer', label: 'ヒーラー', icon: Heart, color: 'text-green-400' },
    { id: 'Flex', label: '移動枠とか', icon: Move, color: 'text-purple-400' },
];

// パーティメンバー型
type PartyMember = {
    characterName: string | null;
    weaponName: string | null;
    constellation: number;
    refinement: number;  // 武器精錬ランク R1-R5
    role: string;
};

export default function NewRecordPage() {
    const router = useRouter();
    const supabase = createClient();
    const [submitting, setSubmitting] = useState(false);

    // 基本情報
    const [timeStr, setTimeStr] = useState('');
    const [category, setCategory] = useState('NPuI');
    const [worldLevel, setWorldLevel] = useState('WL9');
    const [runnerName, setRunnerName] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [platform, setPlatform] = useState('PC');
    const [gameVersion, setGameVersion] = useState('Luna4');
    const [theaterBuff, setTheaterBuff] = useState(false);
    const [leylineBuff, setLeylineBuff] = useState(false);
    const [isLowCost, setIsLowCost] = useState(true);

    // パーティ (4枠)
    const [party, setParty] = useState<PartyMember[]>([
        { characterName: null, weaponName: null, constellation: 0, refinement: 1, role: 'Main DPS' },
        { characterName: null, weaponName: null, constellation: 0, refinement: 1, role: 'Sub DPS' },
        { characterName: null, weaponName: null, constellation: 0, refinement: 1, role: 'Support' },
        { characterName: null, weaponName: null, constellation: 0, refinement: 1, role: 'Support' },
    ]);

    // タイム入力フォーマット (数字6桁 → HH:MM:SS)
    const formatTimeInput = (value: string): string => {
        // 数字のみ抽出
        const digits = value.replace(/\D/g, '').slice(0, 6);
        if (digits.length === 0) return '';
        // 自動フォーマット
        if (digits.length <= 2) return digits;
        if (digits.length <= 4) return `${digits.slice(0, -2)}:${digits.slice(-2)}`;
        return `${digits.slice(0, -4)}:${digits.slice(-4, -2)}:${digits.slice(-2)}`;
    };

    // タイム入力ハンドラ
    const handleTimeInput = (value: string) => {
        setTimeStr(formatTimeInput(value));
    };

    // タイムパース (HH:MM:SS → ミリ秒)
    const parseTime = (str: string): number | null => {
        try {
            const parts = str.split(':');
            let hours = 0, minutes = 0, seconds = 0;
            if (parts.length === 3) {
                hours = parseInt(parts[0]) || 0;
                minutes = parseInt(parts[1]) || 0;
                seconds = parseInt(parts[2]) || 0;
            } else if (parts.length === 2) {
                minutes = parseInt(parts[0]) || 0;
                seconds = parseInt(parts[1]) || 0;
            } else {
                seconds = parseInt(parts[0]) || 0;
            }
            return (hours * 3600 * 1000) + (minutes * 60 * 1000) + (seconds * 1000);
        } catch {
            return null;
        }
    };

    // パーティ更新
    const updatePartyMember = (index: number, field: keyof PartyMember, value: string | number | null) => {
        setParty(prev => {
            const newParty = [...prev];
            newParty[index] = { ...newParty[index], [field]: value };
            // キャラ変更時は武器をリセット
            if (field === 'characterName') {
                newParty[index].weaponName = null;
            }
            return newParty;
        });
    };

    // キャラの武器種を取得
    const getCharWeaponType = (charName: string | null): string | null => {
        if (!charName) return null;
        const charData = (CharacterFullData as Record<string, { weaponType: string }>)[charName];
        return charData?.weaponType || null;
    };

    // 武器フィルタ
    const getFilteredWeapons = (charName: string | null) => {
        const weaponType = getCharWeaponType(charName);
        if (!weaponType) return [];
        return ALL_WEAPONS.filter(w => w.type === weaponType);
    };

    // 低凸判定ロジック
    const checkLowCost = useCallback((members: PartyMember[]) => {
        let limitedFiveStarConstellationTotal = 0;
        let isLowCost = true;

        for (const member of members) {
            if (!member.characterName) continue;

            const charData = ALL_CHARACTERS.find(c => c.name === member.characterName);

            // キャラ: 限定星5のみカウント (rarity=5 かつ !isStandard)
            if (charData?.rarity === 5 && !charData?.isStandard) {
                // 1キャラ2凸以下
                if (member.constellation > 2) {
                    isLowCost = false;
                }
                limitedFiveStarConstellationTotal += member.constellation;
            }

            // 武器: 限定星5のみ判定
            if (member.weaponName) {
                const weaponData = ALL_WEAPONS.find(w => w.name === member.weaponName);
                if (weaponData && weaponData.rarity === 5 && !weaponData.isStandard) {
                    // 限定武器 R2以下 (refinement <= 2)
                    if (member.refinement > 2) {
                        isLowCost = false;
                    }
                }
            }
        }

        // 合計4凸以下
        if (limitedFiveStarConstellationTotal > 4) {
            isLowCost = false;
        }

        return isLowCost;
    }, []);

    // パーティ変更時に低凸判定を更新
    useEffect(() => {
        setIsLowCost(checkLowCost(party));
    }, [party, checkLowCost]);




    // 送信
    const handleSubmit = async () => {
        if (!timeStr || !runnerName) {
            alert("タイムと走者名は必須です");
            return;
        }
        const filledMembers = party.filter(m => m.characterName);
        if (filledMembers.length === 0) {
            alert("少なくとも1人のキャラクターを選択してください");
            return;
        }

        const timeMs = parseTime(timeStr);
        if (timeMs === null) {
            alert("タイムの形式が正しくありません (例: 1:23.456)");
            return;
        }

        // 低凸判定 (stateを使用)
        const finalCategory = `${category}${isLowCost ? 'Low' : 'High'}`;
        const categorySlug = `${worldLevel}_${finalCategory}`;

        setSubmitting(true);

        const { data: record, error } = await supabase
            .from('records')
            .insert({
                user_id: '00000000-0000-0000-0000-000000000000',
                title: `${worldLevel} ${finalCategory} - ${timeStr}`,
                time_ms: timeMs,
                category_slug: categorySlug,
                runner_name: runnerName,
                platform: platform,
                game_version: gameVersion,
                theater_buff: theaterBuff,
                leyline_buff: leylineBuff,
                video_url: videoUrl || null,
                main_attacker_ids: party.filter(m => m.role === 'Main DPS' && m.characterName).map(m => m.characterName),
                party_ids: party.filter(m => m.characterName).map(m => m.characterName),
            })
            .select()
            .single();

        if (error) {
            alert(`エラー: ${error.message}`);
            setSubmitting(false);
            return;
        }

        // record_charactersにパーティメンバーを挿入
        const validMembers = party.filter(m => m.characterName);
        if (validMembers.length > 0 && record) {
            // まずキャラクターのIDを取得
            const { data: characters } = await supabase
                .from('characters')
                .select('id, name')
                .in('name', validMembers.map(m => m.characterName));

            console.log('Found characters:', characters);
            console.log('Looking for:', validMembers.map(m => m.characterName));

            if (characters && characters.length > 0) {
                const charIdMap = new Map(characters.map(c => [c.name, c.id]));

                const recordChars = validMembers
                    .filter(m => charIdMap.has(m.characterName!))
                    .map((m, idx) => ({
                        record_id: record.id,
                        character_id: charIdMap.get(m.characterName!)!,
                        role: m.role,
                        constellation: m.constellation,
                        slot_order: idx,
                    }));

                console.log('Inserting record_characters:', recordChars);

                if (recordChars.length > 0) {
                    const { error: rcError } = await supabase
                        .from('record_characters')
                        .insert(recordChars);

                    if (rcError) {
                        console.error('record_characters insert error:', rcError);
                    } else {
                        console.log('record_characters inserted successfully!');
                    }
                }
            } else {
                console.warn('No matching characters found in DB');
            }
        }

        router.push('/records');
    };

    // キャラアイコン取得
    const getCharIcon = (name: string | null) => {
        if (!name) return null;
        const charData = (CharacterFullData as Record<string, { icon: string }>)[name];
        return charData?.icon ? `https://enka.network/ui/${charData.icon}.png` : null;
    };

    // 武器アイコン取得
    const getWeaponIcon = (name: string | null) => {
        if (!name) return null;
        const weaponData = (WeaponFullData as Record<string, { icon: string }>)[name];
        return weaponData?.icon ? `https://enka.network/ui/${weaponData.icon}.png` : null;
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl pb-32">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/records">
                    <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </button>
                </Link>
                <h1 className="text-3xl font-bold text-white">記録を投稿する</h1>
            </div>

            <div className="glass-panel p-6 rounded-2xl space-y-6">
                {/* 基本情報 */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400">カテゴリ</label>
                        <select
                            className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-purple-500 outline-none"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="PuI">PuI</option>
                            <option value="NPuI">NPuI</option>
                            <option value="PuA">PuA</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400">世界ランク</label>
                        <select
                            className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-purple-500 outline-none"
                            value={worldLevel}
                            onChange={(e) => setWorldLevel(e.target.value)}
                        >
                            <option value="WL9">WL9</option>
                            <option value="WL8">WL8</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400">プラットフォーム</label>
                        <select
                            className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-purple-500 outline-none"
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value)}
                        >
                            <option value="PC">PC</option>
                            <option value="PS5">PS5</option>
                            <option value="Mobile">Mobile</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400">ゲームバージョン</label>
                        <select
                            className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-purple-500 outline-none"
                            value={gameVersion}
                            onChange={(e) => setGameVersion(e.target.value)}
                        >
                            <option value="Luna4">Luna IV</option>
                            <option value="Luna3">Luna III</option>
                            <option value="Luna2">Luna II</option>
                            <option value="Luna1">Luna I</option>
                            <option value="5.8">5.8</option>
                            <option value="5.7">5.7</option>
                            <option value="5.6">5.6</option>
                            <option value="5.5">5.5</option>
                            <option value="5.4">5.4</option>
                            <option value="5.3">5.3</option>
                            <option value="5.2">5.2</option>
                            <option value="5.1">5.1</option>
                            <option value="5.0">5.0</option>
                            <option value="4.8">4.8</option>
                            <option value="4.7">4.7</option>
                            <option value="4.6">4.6</option>
                            <option value="4.5">4.5</option>
                            <option value="4.4">4.4</option>
                            <option value="4.3">4.3</option>
                            <option value="4.2">4.2</option>
                            <option value="4.1">4.1</option>
                            <option value="4.0">4.0</option>
                            <option value="3.8">3.8</option>
                            <option value="3.7">3.7</option>
                            <option value="3.6">3.6</option>
                            <option value="3.5">3.5</option>
                            <option value="3.4">3.4</option>
                            <option value="3.3">3.3</option>
                            <option value="3.2">3.2</option>
                            <option value="3.1">3.1</option>
                            <option value="3.0">3.0</option>
                            <option value="2.8">2.8</option>
                            <option value="2.7">2.7</option>
                            <option value="2.6">2.6</option>
                            <option value="2.5">2.5</option>
                            <option value="2.4">2.4</option>
                            <option value="2.3">2.3</option>
                            <option value="2.2">2.2</option>
                            <option value="2.1">2.1</option>
                            <option value="2.0">2.0</option>
                            <option value="1.6">1.6</option>
                            <option value="1.5">1.5</option>
                            <option value="1.4">1.4</option>
                            <option value="1.3">1.3</option>
                            <option value="1.2">1.2</option>
                            <option value="1.1">1.1</option>
                            <option value="1.0">1.0</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400">シアターバフ</label>
                        <button
                            type="button"
                            onClick={() => setTheaterBuff(!theaterBuff)}
                            className={`w-full p-2 rounded-lg text-sm font-bold transition-colors border ${theaterBuff
                                ? 'bg-purple-600 border-purple-500 text-white'
                                : 'bg-slate-800 border-white/10 text-slate-400'
                                }`}
                        >
                            {theaterBuff ? '✓ あり' : 'なし'}
                        </button>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400">地脈</label>
                        <button
                            type="button"
                            onClick={() => setLeylineBuff(!leylineBuff)}
                            className={`w-full p-2 rounded-lg text-sm font-bold transition-colors border ${leylineBuff
                                ? 'bg-green-600 border-green-500 text-white'
                                : 'bg-slate-800 border-white/10 text-slate-400'
                                }`}
                        >
                            {leylineBuff ? '✓ あり' : 'なし'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400">走者名</label>
                        <input
                            type="text"
                            className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-purple-500 outline-none"
                            placeholder="プレイヤー名"
                            value={runnerName}
                            onChange={(e) => setRunnerName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400">クリアタイム</label>
                        <input
                            type="text"
                            className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-lg font-mono text-white focus:border-purple-500 outline-none placeholder:text-slate-600"
                            placeholder="002626 → 00:26:26"
                            value={timeStr}
                            onChange={(e) => handleTimeInput(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">動画URL</label>
                    <input
                        type="text"
                        className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-purple-500 outline-none"
                        placeholder="https://youtu.be/..."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                    />
                </div>

                {/* パーティ選択 */}
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>⚔️</span> パーティ構成
                        <span className={`text-[10px] px-2 py-0.5 rounded border ${isLowCost
                            ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                            : 'bg-yellow-500/20 border-yellow-500 text-yellow-300'
                            }`}>
                            {isLowCost ? '低凸 (Low Cost)' : '制限なし (Unlimited)'}
                        </span>
                    </h3>

                    {party.map((member, index) => {
                        const filteredWeapons = getFilteredWeapons(member.characterName);

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass p-3 rounded-xl border border-white/10"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center text-sm font-bold text-purple-300">
                                        {index + 1}
                                    </div>
                                    {member.characterName && (
                                        <div className="relative">
                                            <img
                                                src={getCharIcon(member.characterName) || ''}
                                                className="w-12 h-12 rounded-full border-2 border-purple-500 bg-slate-900 shadow-lg"
                                                alt=""
                                            />
                                        </div>
                                    )}
                                    {member.weaponName && (
                                        <img
                                            src={getWeaponIcon(member.weaponName) || ''}
                                            className="w-10 h-10 rounded-lg bg-slate-800 border border-white/20 p-1"
                                            alt=""
                                        />
                                    )}
                                    {member.characterName && (
                                        <span className="text-xs text-slate-300">C{member.constellation}</span>
                                    )}
                                    {member.weaponName && (
                                        <span className="text-xs text-amber-400">R{member.refinement}</span>
                                    )}
                                </div>

                                <div className="grid grid-cols-5 gap-2">
                                    {/* キャラ選択 */}
                                    <select
                                        className="bg-slate-800 border border-white/10 rounded-lg p-1.5 text-white text-xs focus:border-purple-500 outline-none truncate"
                                        value={member.characterName || ''}
                                        onChange={(e) => updatePartyMember(index, 'characterName', e.target.value || null)}
                                    >
                                        <option value="">キャラ...</option>
                                        {ALL_CHARACTERS.map(c => (
                                            <option key={c.name} value={c.name}>{c.nameJp}</option>
                                        ))}
                                    </select>

                                    {/* 武器選択 */}
                                    <select
                                        className="bg-slate-800 border border-white/10 rounded-lg p-1.5 text-white text-xs focus:border-purple-500 outline-none truncate disabled:opacity-50"
                                        value={member.weaponName || ''}
                                        onChange={(e) => updatePartyMember(index, 'weaponName', e.target.value || null)}
                                        disabled={!member.characterName}
                                    >
                                        <option value="">武器...</option>
                                        {filteredWeapons.map(w => (
                                            <option key={w.name} value={w.name}>{w.nameJp}</option>
                                        ))}
                                    </select>

                                    {/* キャラ凸数 */}
                                    <select
                                        className="bg-slate-800 border border-white/10 rounded-lg p-1.5 text-white text-xs focus:border-purple-500 outline-none"
                                        value={member.constellation}
                                        onChange={(e) => updatePartyMember(index, 'constellation', parseInt(e.target.value))}
                                    >
                                        {[0, 1, 2, 3, 4, 5, 6].map(c => (
                                            <option key={c} value={c}>C{c}</option>
                                        ))}
                                    </select>

                                    {/* 武器精錬ランク */}
                                    <select
                                        className="bg-slate-800 border border-white/10 rounded-lg p-1.5 text-white text-xs focus:border-purple-500 outline-none disabled:opacity-50"
                                        value={member.refinement}
                                        onChange={(e) => updatePartyMember(index, 'refinement', parseInt(e.target.value))}
                                        disabled={!member.weaponName}
                                    >
                                        {[1, 2, 3, 4, 5].map(r => (
                                            <option key={r} value={r}>R{r}</option>
                                        ))}
                                    </select>

                                    {/* ロール */}
                                    <select
                                        className="bg-slate-800 border border-white/10 rounded-lg p-1.5 text-white text-xs focus:border-purple-500 outline-none"
                                        value={member.role}
                                        onChange={(e) => updatePartyMember(index, 'role', e.target.value)}
                                    >
                                        {ROLES.map(r => (
                                            <option key={r.id} value={r.id}>{r.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {submitting ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />}
                    記録を送信
                </motion.button>
            </div>
        </div>
    );
}
