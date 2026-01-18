import { createClient } from '@/utils/supabase/server'
import { CHARACTER_MAP, ELEMENT_MAP, WEAPON_MAP } from '@/data/localization'
import IconMap from '@/data/character_data.json'
import type { Character } from '@/types'

export default async function CharactersPage() {
    const supabase = await createClient()

    const { data: rawCharacters, error } = await supabase
        .from('characters')
        .select('*')
        .order('name')

    if (error) {
        return <div className="text-red-400 text-center py-20">キャラクターの読み込みに失敗しました。</div>
    }

    const characters = (rawCharacters || []) as Character[]

    // Group by Element with custom sort order
    const groupedCharacters = characters.reduce((acc, char) => {
        const element = char.element || 'Unassigned'
        if (!acc[element]) acc[element] = []
        acc[element].push(char)
        return acc
    }, {} as Record<string, Character[]>)

    const elementOrder = ['Pyro', 'Hydro', 'Anemo', 'Electro', 'Dendro', 'Cryo', 'Geo']

    // Helper to get colors based on element
    const getElementColor = (el: string) => {
        switch (el) {
            case 'Pyro': return 'text-red-400 border-red-500/30 shadow-red-500/20 from-red-500/20';
            case 'Hydro': return 'text-blue-400 border-blue-500/30 shadow-blue-500/20 from-blue-500/20';
            case 'Anemo': return 'text-emerald-400 border-emerald-500/30 shadow-emerald-500/20 from-emerald-500/20';
            case 'Electro': return 'text-purple-400 border-purple-500/30 shadow-purple-500/20 from-purple-500/20';
            case 'Dendro': return 'text-green-400 border-green-500/30 shadow-green-500/20 from-green-500/20';
            case 'Cryo': return 'text-cyan-400 border-cyan-500/30 shadow-cyan-500/20 from-cyan-500/20';
            case 'Geo': return 'text-yellow-400 border-yellow-500/30 shadow-yellow-500/20 from-yellow-500/20';
            default: return 'text-slate-400 border-slate-500/30 shadow-slate-500/20 from-slate-500/20';
        }
    }

    const getElementBg = (el: string) => {
        switch (el) {
            case 'Pyro': return 'bg-gradient-to-br from-red-900/40 to-slate-900/40';
            case 'Hydro': return 'bg-gradient-to-br from-blue-900/40 to-slate-900/40';
            case 'Anemo': return 'bg-gradient-to-br from-emerald-900/40 to-slate-900/40';
            case 'Electro': return 'bg-gradient-to-br from-purple-900/40 to-slate-900/40';
            case 'Dendro': return 'bg-gradient-to-br from-green-900/40 to-slate-900/40';
            case 'Cryo': return 'bg-gradient-to-br from-cyan-900/40 to-slate-900/40';
            case 'Geo': return 'bg-gradient-to-br from-yellow-900/40 to-slate-900/40';
            default: return 'bg-slate-800/40';
        }
    }

    return (
        <div className="container mx-auto px-4 py-12 pb-32">
            <div className="flex flex-col items-center mb-16">
                <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 tracking-tight mb-4 drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                    CHARACTERS
                </h1>
                <p className="text-slate-400 text-lg">テイワットの仲間たち</p>
            </div>

            <div className="flex flex-col gap-16">
                {elementOrder.map((element) => {
                    const chars = groupedCharacters[element]
                    if (!chars || chars.length === 0) return null

                    const colorClass = getElementColor(element);

                    return (
                        <div key={element} className="flex flex-col gap-8">
                            <div className="flex items-center gap-4 px-2 border-b border-white/5 pb-4">
                                <span className={`text-4xl filter drop-shadow-lg ${colorClass.split(' ')[0]}`}>
                                    {element === 'Pyro' && '🔥'}
                                    {element === 'Hydro' && '💧'}
                                    {element === 'Anemo' && '🍃'}
                                    {element === 'Electro' && '⚡'}
                                    {element === 'Dendro' && '🌿'}
                                    {element === 'Cryo' && '❄️'}
                                    {element === 'Geo' && '🪨'}
                                </span>
                                <h2 className={`text-3xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 uppercase`}>
                                    {ELEMENT_MAP[element] || element}
                                </h2>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                {chars.map((char) => {
                                    const iconName = (IconMap as any)[char.name] || '';
                                    const iconUrl = iconName ? `https://enka.network/ui/${iconName}.png` : null;
                                    const cardBg = getElementBg(element);

                                    return (
                                        <div key={char.id} className={`
                                        group relative overflow-hidden rounded-2xl
                                        border border-white/5 bg-white/5 backdrop-blur-md
                                        hover:border-white/20 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10
                                        transition-all duration-300 ease-out
                                        flex flex-col
                                    `}>
                                            <div className={`absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity ${cardBg}`}></div>

                                            <div className={`absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden`}>
                                                <div className={`absolute top-0 right-0 transform translate-x-[50%] -translate-y-[50%] w-full h-full rotate-45 ${char.rarity === 5 ? 'bg-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'bg-purple-500/20'}`}></div>
                                            </div>

                                            <div className="relative aspect-square p-4 flex items-center justify-center">
                                                {iconUrl ? (
                                                    <img
                                                        src={iconUrl}
                                                        alt={char.name}
                                                        className="w-full h-full object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300 filter group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl border-2 ${colorClass}`}>
                                                        {char.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="relative p-4 pt-0 text-center z-10">
                                                <div className="font-bold text-slate-100 text-lg leading-tight mb-1 truncate">
                                                    {CHARACTER_MAP[char.name] || char.name}
                                                </div>
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className={`text-[10px] items-center px-2 py-0.5 rounded-full border border-white/10 bg-black/20 text-slate-400 uppercase tracking-wider`}>
                                                        {WEAPON_MAP[`WEAPON_${char.weapon_type.toUpperCase()}`] || char.weapon_type}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
