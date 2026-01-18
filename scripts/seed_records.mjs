
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    console.log('Seeding dummy records...');

    // 1. Fetch some characters to use
    const { data: chars } = await supabase.from('characters').select('*');
    if (!chars || chars.length === 0) {
        console.error('No characters found. Run import_characters.mjs first.');
        return;
    }

    const findChar = (name) => chars.find(c => c.name.includes(name));

    // Dummy Data based on Elemental Specialist achievements
    const dummyRecords = [
        {
            title: "Performance May Decline in Low Temperatures",
            description: "Defeated 4 enemies with Superconduct in 2s. \nUsed Kaeya and Lisa combo. Timing is tricky.",
            runner_name: "KaeyaSimp",
            time_ms: 26260,
            category_slug: "WL9_PuLow",
            video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            party: [
                { name: 'Kaeya', role: 'Main DPS', constellation: 2, weapon: 'Favonius Sword', refinement: 1 },
                { name: 'Lisa', role: 'Support', constellation: 0, weapon: 'The Flute', refinement: 3 },
            ]
        },
        {
            title: "The Art of War - Overload Speedrun",
            description: "Cleared the localized Overload challenge in 1.5s!\nXiangling's Guoba + Fischl's Oz is the key.",
            runner_name: "ElementalMaster",
            time_ms: 15340,
            category_slug: "WL9_NPuLow",
            video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            party: [
                { name: 'Xiangling', role: 'Sub DPS', constellation: 6, weapon: 'Calamity Queller', refinement: 1 },
                { name: 'Fischl', role: 'Sub DPS', constellation: 6, weapon: 'The Stringless', refinement: 5 },
                { name: 'Bennett', role: 'Support', constellation: 5, weapon: 'Sapwood Blade', refinement: 1 },
                { name: 'Kazuha', role: 'Support', constellation: 2, weapon: 'Iron Sting', refinement: 2 },
            ]
        },
        {
            title: "Premium Freeze & Vaporize Team",
            description: "Ayaka and Klee's unusual combo. Works surprisingly well!",
            runner_name: "Alice",
            time_ms: 45000,
            category_slug: "WL9_PuLow",
            video_url: "",
            party: [
                { name: 'Kamisato Ayaka', role: 'Main DPS', constellation: 2, weapon: 'Mistsplitter Reforged', refinement: 1 },
                { name: 'Klee', role: 'Sub DPS', constellation: 2, weapon: 'Lost Prayer to the Sacred Winds', refinement: 1 },
                { name: 'Fischl', role: 'Support', constellation: 6, weapon: 'Polar Star', refinement: 1 },
                { name: 'Sigewinne', role: 'Support', constellation: 0, weapon: 'Silvershower Heartstrings', refinement: 1 },
            ]
        },
        {
            title: "Mono Geo Itto Smash",
            description: "Spiral Abyss Floor 12-1 9s clear.\nItto C2 is a beast.",
            runner_name: "UshiLover",
            time_ms: 9000,
            category_slug: "WL9_PuHigh",
            video_url: "",
            party: [
                { name: 'Arataki Itto', role: 'Main DPS', constellation: 2, weapon: 'Redhorn Stonethresher', refinement: 1 },
                { name: 'Gorou', role: 'Support', constellation: 6, weapon: 'Favonius Warbow', refinement: 5 },
                { name: 'Zhongli', role: 'Support', constellation: 0, weapon: 'Black Tassel', refinement: 5 },
                { name: 'Albedo', role: 'Sub DPS', constellation: 0, weapon: 'Cinnabar Spindle', refinement: 5 },
            ]
        },
        {
            title: "National Team F2P Run",
            description: "Classic National Team run on Cryo Regisvine.",
            runner_name: "F2P_God",
            time_ms: 32000,
            category_slug: "WL9_PuLow",
            video_url: "",
            party: [
                { name: 'Xiangling', role: 'Main DPS', constellation: 4, weapon: '"The Catch"', refinement: 5 },
                { name: 'Xingqiu', role: 'Sub DPS', constellation: 6, weapon: 'Sacrificial Sword', refinement: 5 },
                { name: 'Bennett', role: 'Support', constellation: 1, weapon: 'Prototype Rancour', refinement: 1 },
                { name: 'Chongyun', role: 'Sub DPS', constellation: 2, weapon: 'Favonius Greatsword', refinement: 5 },
            ]
        }
    ];

    for (const rec of dummyRecords) {
        // Insert Record
        const { data: recordData, error: recordError } = await supabase
            .from('records')
            .insert({
                title: rec.title,
                description: rec.description,
                video_url: rec.video_url,
                runner_name: rec.runner_name,
                time_ms: rec.time_ms,
                category_slug: rec.category_slug,
                main_attacker_ids: rec.party.filter(p => p.role === 'Main DPS').map(p => p.name),
                party_ids: rec.party.map(p => p.name),
                user_id: '00000000-0000-0000-0000-000000000000'
            })
            .select() // Return the inserted row so we get the ID
            .single();

        if (recordError) {
            console.error(`Failed to insert record "${rec.title}":`, recordError.message);
            continue;
        }

        const recordId = recordData.id;

        // Insert Party
        const partyData = rec.party.map((p, idx) => {
            const char = findChar(p.name);
            if (!char) {
                console.warn(`Character ${p.name} not found in DB, skipping member.`);
                return null;
            }
            return {
                record_id: recordId,
                character_id: char.id,
                role: p.role,
                constellation: p.constellation,
                weapon_name: p.weapon,
                refinement: p.refinement,
                slot_order: idx
            };
        }).filter(p => p !== null);

        if (partyData.length > 0) {
            const { error: partyError } = await supabase
                .from('record_characters')
                .insert(partyData);

            if (partyError) {
                console.error('Failed to insert party members:', partyError.message);
            }
        }
        console.log(`Created record: ${rec.title}`);
    }

    console.log('Seed completed.');
}

main().catch(err => console.error(err));
