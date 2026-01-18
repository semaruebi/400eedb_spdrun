export type Record = {
    id: string
    user_id: string
    title: string
    description?: string
    video_url?: string
    created_at: string
    updated_at: string
    // Project Melusine Extensions
    category_slug?: string
    runner_name?: string
    time_ms?: number
    main_attacker_ids?: string[]
    party_ids?: string[]
    platform?: string
    game_version?: string
}

export type Character = {
    id: string
    name: string
    element: string
    weapon_type: string
    rarity: number
    icon_name?: string
}

export type RecordCharacter = {
    record_id: string
    character_id: string
    role?: string // 'Main DPS', 'Sub DPS', 'Support', 'Healer'
    constellation?: number
    artifact_set?: string
    weapon?: string
    character?: Character
}

export type RecordWithDetails = Record & {
    characters?: RecordCharacter[]
    record_characters?: RecordCharacter[] // Supabase alias often returns this
}
