
import { createClient } from '@/utils/supabase/server'
import { RecordRow } from '@/components/RecordRow'
import { FilterPanel } from '@/components/FilterPanel'
// import { RecordCard } from '@/components/RecordCard' // Optional
import Link from 'next/link'
import type { RecordWithDetails } from '@/types'
import { REVERSE_CHARACTER_MAP } from '@/data/localization'

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

function getEnglishNames(searchTerm: string): string[] {
    if (!searchTerm) return []
    const candidates: string[] = []
    Object.entries(REVERSE_CHARACTER_MAP).forEach(([jpName, enName]) => {
        if (jpName.includes(searchTerm)) candidates.push(enName)
    })
    if (candidates.length === 0) candidates.push(searchTerm)
    return candidates
}

export default async function RecordsPage({ searchParams }: Props) {
    const supabase = await createClient()
    const params = await searchParams

    const includeChar = typeof params.include === 'string' ? params.include : null
    const excludeChar = typeof params.exclude === 'string' ? params.exclude : null
    const category = typeof params.category === 'string' ? params.category : 'NPuI'
    const wl = typeof params.wl === 'string' ? params.wl : 'WL9'
    const cost = typeof params.cost === 'string' ? params.cost : 'all'

    let query = supabase
        .from('records')
        .select(`
    *,
    record_characters(
        *,
        character: characters(*)
    )
        `)
        // Filter by category prefix (e.g. WL9_NPuI -> WL9_NPuILow)
        .like('category_slug', `${wl}_${category}%`)
        .order('time_ms', { ascending: true, nullsFirst: false }) // Sort by Time
        .order('created_at', { ascending: false })

    // Cost filtering
    if (cost === 'low') {
        query = query.like('category_slug', '%Low')
    } else if (cost === 'high') {
        query = query.like('category_slug', '%High')
    }

    // ... Filter Logic (Include/Exclude) ...
    // Note: To support precise Main Attacker filtering, we'd use `main_attacker_ids` column if indexed.
    // For now reusing existing char name logic for broad filtering.

    // Include Filtering (AND Logic)
    if (includeChar) {
        const terms = includeChar.split(',').map(s => s.trim()).filter(s => s)

        for (const term of terms) {
            const targetNames = getEnglishNames(term)
            if (targetNames.length > 0) {
                const { data: matchingRecords } = await supabase
                    .from('record_characters')
                    .select('record_id, character:characters!inner(name)')
                    .in('character.name', targetNames)

                if (matchingRecords && matchingRecords.length > 0) {
                    // Accumulate AND conditions (ID must be in this set AND previous sets)
                    const ids = matchingRecords.map(r => r.record_id)
                    query = query.in('id', ids)
                } else {
                    // No records match this specific term, so result is empty
                    query = query.in('id', ['00000000-0000-0000-0000-000000000000'])
                    break
                }
            } else {
                query = query.in('id', ['00000000-0000-0000-0000-000000000000'])
                break
            }
        }
    }

    // Exclude Filtering (OR Logic - Exclude if ANY match)
    if (excludeChar) {
        const terms = excludeChar.split(',').map(s => s.trim()).filter(s => s)
        let allTargetNames: string[] = []

        terms.forEach(term => {
            allTargetNames = [...allTargetNames, ...getEnglishNames(term)]
        })

        if (allTargetNames.length > 0) {
            const { data: excludedRecords } = await supabase
                .from('record_characters')
                .select('record_id, character:characters!inner(name)')
                .in('character.name', allTargetNames)

            if (excludedRecords && excludedRecords.length > 0) {
                const ids = excludedRecords.map(r => r.record_id)
                // Remove duplicates to keep query clean
                const uniqueIds = Array.from(new Set(ids))
                query = query.not('id', 'in', `(${uniqueIds.join(',')})`)
            }
        }
    }

    const { data: records, error } = await query

    const typedRecords = (records || []) as unknown as RecordWithDetails[]

    return (
        <div className="container mx-auto px-4 py-8 pb-32">
            <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
                        Genshin Impact : Elite Enemies
                    </h1>
                    <p className="text-slate-400">RTA Leader Boards</p>
                </div>

                <Link
                    href="/records/new"
                    className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] backdrop-blur-md flex items-center gap-2 font-bold tracking-wider"
                >
                    <span className="text-xl leading-none">+</span> 記録を投稿
                </Link>
            </div>

            <FilterPanel />

            {error && <div className="text-red-400 text-center mb-4">Error loading records: {error.message}</div>}

            <div className="space-y-4">
                {typedRecords.length === 0 ? (
                    <div className="glass p-12 rounded-2xl text-center border-dashed border-white/10">
                        <p className="text-slate-400 mb-6 text-lg">このカテゴリーには記録がありません。</p>
                    </div>
                ) : (
                    typedRecords.map((record, i) => (
                        <RecordRow key={record.id} record={record} rank={i + 1} />
                    ))
                )}
            </div>
        </div>
    )
}

