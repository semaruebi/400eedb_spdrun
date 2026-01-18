"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, X, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CharacterFullData from "@/data/character_full_data.json";
import { CHARACTER_MAP, ELEMENT_MAP } from "@/data/localization";

type CharacterData = {
    icon: string;
    weaponType: string;
    element: string;
    rarity: number;
};

const ENKA_ELEMENTS: Record<string, string> = {
    'Pyro': 'Fire',
    'Hydro': 'Water',
    'Anemo': 'Wind',
    'Electro': 'Electric',
    'Dendro': 'Grass',
    'Cryo': 'Ice',
    'Geo': 'Rock'
};

export function FilterPanel() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // URL Params States
    const [includeChar, setIncludeChar] = useState(searchParams.get("include") || "");
    const [excludeChar, setExcludeChar] = useState(searchParams.get("exclude") || "");
    const [activeTab, setActiveTab] = useState(searchParams.get("category") || "NPuI");
    const [costType, setCostType] = useState(searchParams.get("cost") || "all");
    const [wl, setWl] = useState(searchParams.get("wl") || "WL9");

    // Local Input States
    const [includeInput, setIncludeInput] = useState("");
    const [excludeInput, setExcludeInput] = useState("");

    // Character Selector State
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [selectorTarget, setSelectorTarget] = useState<'include' | 'exclude'>('include');
    const [selectedElement, setSelectedElement] = useState('All');

    // Update state when URL changes
    useEffect(() => {
        setIncludeChar(searchParams.get("include") || "");
        setExcludeChar(searchParams.get("exclude") || "");
        setActiveTab(searchParams.get("category") || "NPuI");
        setCostType(searchParams.get("cost") || "all");
        setWl(searchParams.get("wl") || "WL9");
    }, [searchParams]);

    // キャラクターリストの生成
    const characterList = useMemo(() => {
        return Object.entries(CharacterFullData as Record<string, CharacterData>)
            .map(([enName, data]) => ({
                enName,
                jpName: CHARACTER_MAP[enName] || enName,
                ...data
            }))
            .sort((a, b) => b.rarity - a.rarity); // 星5優先
    }, []);

    // フィルタリングされたキャラリスト
    const filteredCharacters = useMemo(() => {
        if (selectedElement === 'All') return characterList;
        const targetElement = ENKA_ELEMENTS[selectedElement];
        return characterList.filter(c => c.element === targetElement);
    }, [characterList, selectedElement]);

    const handleSearch = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== "all") params.set(key, value);
        else params.delete(key);
        router.push(`/records?${params.toString()}`);
    }, [router, searchParams]);

    const handleTabChange = (slug: string) => {
        handleSearch("category", slug);
    };

    const handleCostChange = (type: string) => {
        handleSearch("cost", type);
    };

    const handleWlChange = (type: string) => {
        handleSearch("wl", type);
    };

    const openSelector = (target: 'include' | 'exclude') => {
        setSelectorTarget(target);
        setIsSelectorOpen(true);
    };

    const addCharFilter = (target: 'include' | 'exclude', name: string) => {
        const currentStr = target === 'include' ? includeChar : excludeChar;
        const currentList = currentStr ? currentStr.split(',') : [];

        if (!currentList.includes(name)) {
            const newList = [...currentList, name];
            const newStr = newList.join(',');
            handleSearch(target, newStr);
        }

        if (target === 'include') setIncludeInput("");
        else setExcludeInput("");
    };

    const removeCharFilter = (target: 'include' | 'exclude', name: string) => {
        const currentStr = target === 'include' ? includeChar : excludeChar;
        const currentList = currentStr ? currentStr.split(',') : [];
        const newList = currentList.filter(c => c !== name);
        const newStr = newList.join(',');
        handleSearch(target, newStr);
    };

    const handleCharacterSelect = (charName: string) => {
        addCharFilter(selectorTarget, charName);
        setIsSelectorOpen(false);
    };

    const clearFilters = () => {
        router.push("/records");
    };

    const tabs = [
        { id: "NPuI", label: "NPuI" },
        { id: "PuI", label: "PuI" },
        { id: "PuA", label: "PuA" },
        { id: "Enkanomiya", label: "Enkanomiya" },
        { id: "Local_Legend", label: "Local Legend" },
    ];

    const elements = ['All', 'Pyro', 'Hydro', 'Anemo', 'Electro', 'Dendro', 'Cryo', 'Geo'];

    // Helper to render tags
    const renderTags = (target: 'include' | 'exclude', str: string) => {
        if (!str) return null;
        return (
            <div className="flex flex-wrap gap-2 mt-2">
                {str.split(',').map(name => (
                    <span key={name} className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${target === 'include' ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30' : 'bg-red-500/20 text-red-200 border border-red-500/30'}`}>
                        {name}
                        <button onClick={() => removeCharFilter(target, name)} className="hover:text-white">
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="mb-8 space-y-6">
            {/* Category Tabs & Filters */}
            <div className="flex flex-col gap-4">
                {/* Top Row: Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap
                  ${activeTab === tab.id
                                    ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40"
                                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5"}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Bottom Row: Filters (WL & Cost) */}
                <div className="flex flex-wrap gap-4 items-center justify-end">
                    {/* WL Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">World</span>
                        <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                            {["WL9", "WL8"].map((level) => (
                                <button
                                    key={level}
                                    onClick={() => handleWlChange(level)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${wl === level ? 'bg-purple-600/50 text-white' : 'text-slate-400 hover:text-white'}`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Cost Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cost</span>
                        <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                            <button
                                onClick={() => handleCostChange("all")}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${costType === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                全て
                            </button>
                            <button
                                onClick={() => handleCostChange("high")}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${costType === 'high' ? 'bg-yellow-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                制限なし
                            </button>
                            <button
                                onClick={() => handleCostChange("low")}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${costType === 'low' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                低凸
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Inputs */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-6 rounded-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <div className="flex items-center gap-2 mb-6">
                    <Filter className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-bold text-white tracking-wide">フィルター</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Include */}
                    <div className="relative group">
                        <label className="block text-[10px] font-bold uppercase text-purple-300 mb-2 tracking-widest pl-1">含むキャラ</label>
                        <div className="relative flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="選択または入力（Enter）"
                                    value={includeInput}
                                    onChange={(e) => setIncludeInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addCharFilter("include", includeInput)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all placeholder:text-slate-600"
                                />
                            </div>
                            <button
                                onClick={() => openSelector('include')}
                                className="p-3 bg-white/5 hover:bg-purple-600/20 text-slate-400 hover:text-purple-300 rounded-xl border border-white/10 transition-all"
                                title="リストから選択"
                            >
                                <Users className="w-5 h-5" />
                            </button>
                        </div>
                        {renderTags('include', includeChar)}
                    </div>

                    {/* Exclude */}
                    <div className="relative group">
                        <label className="block text-[10px] font-bold uppercase text-red-300 mb-2 tracking-widest pl-1">除外キャラ</label>
                        <div className="relative flex gap-2">
                            <div className="relative flex-1">
                                <X className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-red-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="選択または入力（Enter）"
                                    value={excludeInput}
                                    onChange={(e) => setExcludeInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addCharFilter("exclude", excludeInput)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-red-500/50 focus:bg-white/10 transition-all placeholder:text-slate-600"
                                />
                            </div>
                            <button
                                onClick={() => openSelector('exclude')}
                                className="p-3 bg-white/5 hover:bg-red-600/20 text-slate-400 hover:text-red-300 rounded-xl border border-white/10 transition-all"
                                title="リストから選択"
                            >
                                <Users className="w-5 h-5" />
                            </button>
                        </div>
                        {renderTags('exclude', excludeChar)}
                    </div>

                    {/* Actions */}
                    <div className="flex items-end gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={clearFilters}
                            className="w-full p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl border border-white/10 transition-colors flex items-center justify-center gap-2"
                            title="フィルターをクリア"
                        >
                            <X className="w-4 h-4" />
                            <span className="text-sm font-bold">クリア</span>
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* Character Selector Modal */}
            <AnimatePresence>
                {isSelectorOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-white/10 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-white">
                                    キャラクターを選択 ({selectorTarget === 'include' ? '含む' : '除外'})
                                </h3>
                                <button onClick={() => setIsSelectorOpen(false)} className="text-slate-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Element Filter */}
                            <div className="p-4 border-b border-white/10 flex gap-2 overflow-x-auto">
                                {elements.map(elm => (
                                    <button
                                        key={elm}
                                        onClick={() => setSelectedElement(elm)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap flex-shrink-0
                                            ${selectedElement === elm
                                                ? 'bg-white text-slate-900'
                                                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        {ELEMENT_MAP[elm] || elm}
                                    </button>
                                ))}
                            </div>

                            {/* Character Grid */}
                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                                    {filteredCharacters.map(char => (
                                        <button
                                            key={char.enName}
                                            onClick={() => handleCharacterSelect(char.jpName)}
                                            className="group relative flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-white/5 transition-colors"
                                        >
                                            <div className={`relative w-12 h-12 rounded-full border-2 overflow-hidden
                                                ${char.rarity === 5 ? 'border-orange-400/50' : 'border-purple-400/50'}
                                                group-hover:scale-110 transition-transform`}
                                            >
                                                <img
                                                    src={`https://enka.network/ui/${char.icon}.png`}
                                                    alt={char.enName}
                                                    className="w-full h-full object-cover bg-slate-800 scale-125"
                                                    loading="lazy"
                                                />
                                            </div>
                                            <span className="text-[10px] text-slate-400 group-hover:text-white text-center leading-tight">
                                                {char.jpName}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                        <div className="absolute inset-0 -z-10" onClick={() => setIsSelectorOpen(false)} />
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
