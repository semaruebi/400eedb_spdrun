
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// NOTE: Ideally we should use SERVICE_ROLE_KEY for admin tasks to bypass RLS, 
// but for now since we set up public insert policies, ANON_KEY works.
// If it fails due to RLS, I will need to ask user for service role key or relax RLS further.

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CHARACTERS_URL = 'https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/characters.json';
const LOC_URL = 'https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/loc.json';

// Mapping tables
const ELEMENT_MAP_ENKA_TO_DB = {
    'Fire': 'Pyro',
    'Water': 'Hydro',
    'Wind': 'Anemo',
    'Electric': 'Electro',
    'Grass': 'Dendro',
    'Ice': 'Cryo',
    'Rock': 'Geo'
};

const WEAPON_MAP_ENKA_TO_DB = {
    'WEAPON_SWORD_ONE_HAND': 'Sword',
    'WEAPON_CLAYMORE': 'Claymore',
    'WEAPON_POLE': 'Polearm',
    'WEAPON_BOW': 'Bow',
    'WEAPON_CATALYST': 'Catalyst'
};

async function main() {
    console.log('Fetching EnkaNetwork data...');
    const [charsRes, locRes] = await Promise.all([
        fetch(CHARACTERS_URL),
        fetch(LOC_URL)
    ]);

    const charsData = await charsRes.json();
    const locData = await locRes.json();
    const enMap = locData.en;

    console.log(`Found ${Object.keys(charsData).length} characters definitions.`);

    const charactersToUpsert = [];

    for (const [id, charInfo] of Object.entries(charsData)) {
        // Skip specialized/test characters if needed? 
        // For now, let's try to get mostly playable ones.
        // Playable characters usually have "SideIconName" or checking a huge ID range.
        // But simply filtering by having a valid Element and Weapon is a good start.

        const hash = charInfo.NameTextMapHash;
        if (!hash || !enMap[hash]) continue;

        const enName = enMap[hash];
        const enkaElement = charInfo.Element;
        const enkaWeapon = charInfo.WeaponType;

        const dbElement = ELEMENT_MAP_ENKA_TO_DB[enkaElement];
        const dbWeapon = WEAPON_MAP_ENKA_TO_DB[enkaWeapon];

        if (dbElement && dbWeapon) {
            // It's a valid playable character structure
            // Fix Traveler name because Enka has "Traveler" but multiple IDs (Aether/Lumine/Elements)
            // We want distinct entries? Or just one "Traveler"?
            // The DB unique constraint is on `name`.
            // Let's rely on the Enka name. "Traveler" appears multiple times with different elements.
            // Our Schema allows unique Name. So we might need to qualify Traveler names or just skip duplicates.
            // For simplicity, we skip if already in list (first one wins, usually Anemo).

            // Actually, best to ignore "Traveler" dupes or rename them "Traveler (Anemo)" etc if we want.
            // For now, let's just let Upsert handle it (it will fail or overwrite).
            // We'll rename Traveler to include Element to avoid unique constraint violation if possible.
            let nameToUse = enName;
            if (nameToUse === 'Traveler') {
                nameToUse = `Traveler (${dbElement})`;
            }

            const rarity = charInfo.QualityType === 'QUALITY_ORANGE' ? 5 : 4;
            const sideIconName = charInfo.SideIconName; // e.g. "UI_AvatarIcon_Kazuha"

            charactersToUpsert.push({
                name: nameToUse,
                element: dbElement,
                weapon_type: dbWeapon,
                rarity: rarity,
                icon_name: sideIconName
            });
        }
    }

    console.log(`Prepared ${charactersToUpsert.length} characters for import.`);

    let successCount = 0;
    let failCount = 0;

    for (const char of charactersToUpsert) {
        const { error } = await supabase
            .from('characters')
            .upsert(char, { onConflict: 'name' });

        if (error) {
            console.error(`Failed to upsert ${char.name}:`, error.message);
            failCount++;
        } else {
            successCount++;
        }
    }

    const iconMap = {};
    for (const char of charactersToUpsert) {
        iconMap[char.name] = char.icon_name;
    }

    fs.writeFileSync(path.join(__dirname, '../src/data/character_data.json'), JSON.stringify(iconMap, null, 2));
    console.log('Generated character_data.json');

    console.log(`Import finished. Success: ${successCount}, Failed: ${failCount}`);
}

main().catch(err => console.error(err));
