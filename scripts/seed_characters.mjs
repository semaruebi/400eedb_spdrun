/**
 * characters テーブルに character_full_data.json からデータをシードするスクリプト
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// .env.local を読み込む
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// element 名の変換マップ (API/JSON → DB スキーマ)
const ELEMENT_MAP = {
    'Fire': 'Pyro',
    'Water': 'Hydro',
    'Ice': 'Cryo',
    'Wind': 'Anemo',
    'Electric': 'Electro',
    'Rock': 'Geo',
    'Grass': 'Dendro',
};

async function main() {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // character_full_data.json を読む
    const dataPath = path.join(__dirname, '..', 'src', 'data', 'character_full_data.json');
    const charData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    const characters = Object.entries(charData).map(([name, data]) => ({
        name,
        element: ELEMENT_MAP[data.element] || null,
        weapon_type: data.weaponType || null,
        rarity: null  // character_full_data.json にrarityがないので null
    }));

    console.log(`Inserting ${characters.length} characters...`);

    // upsert (name が unique なので conflict で無視)
    const { data, error } = await supabase
        .from('characters')
        .upsert(characters, { onConflict: 'name', ignoreDuplicates: true });

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Done! Characters inserted/updated.');
    }
}

main();
