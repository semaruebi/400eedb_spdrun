
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
            video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            party: [
                { name: 'Kaeya', role: 'Main DPS', constellation: 2 },
                { name: 'Lisa', role: 'Support', constellation: 0 },
            ]
        },
        {
            title: "The Art of War - Overload Speedrun",
            description: "Cleared the localized Overload challenge in 1.5s!\nXiangling's Guoba + Fischl's Oz is the key.",
            video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            party: [
                { name: 'Xiangling', role: 'Sub DPS', constellation: 6 },
                { name: 'Fischl', role: 'Sub DPS', constellation: 6 },
                { name: 'Bennett', role: 'Support', constellation: 5 },
                { name: 'Kazuha', role: 'Support', constellation: 2 },
            ]
        },
        {
            title: "Hyperbloom 100k Dmg Test",
            description: "Testing Nahida + Kuki Shinobu hyperbloom setup.\nEasy 30k x 2 procs per second.",
            video_url: "",
            party: [
                { name: 'Nahida', role: 'Main DPS', constellation: 2 },
                { name: 'Kuki Shinobu', role: 'Healer', constellation: 4 },
                { name: 'Xingqiu', role: 'Sub DPS', constellation: 6 },
                { name: 'Yelan', role: 'Sub DPS', constellation: 1 },
            ]
        },
        {
            title: "Mono Geo Itto Smash",
            description: "Spiral Abyss Floor 12-1 9s clear.\nItto C2 is a beast.",
            video_url: "",
            party: [
                { name: 'Arataki Itto', role: 'Main DPS', constellation: 2 },
                { name: 'Gorou', role: 'Support', constellation: 6 },
                { name: 'Zhongli', role: 'Support', constellation: 0 },
                { name: 'Albedo', role: 'Sub DPS', constellation: 0 },
            ]
        },
        {
            title: "National Team F2P Run",
            description: "Classic National Team run on Cryo Regisvine.",
            video_url: "",
            party: [
                { name: 'Xiangling', role: 'Main DPS', constellation: 4 },
                { name: 'Xingqiu', role: 'Sub DPS', constellation: 6 },
                { name: 'Bennett', role: 'Support', constellation: 1 },
                { name: 'Chongyun', role: 'Sub DPS', constellation: 2 },
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
                video_url: rec.video_url
            })
            .select() // Return the inserted row so we get the ID
            .single();

        if (recordError) {
            console.error(`Failed to insert record "${rec.title}":`, recordError.message);
            continue;
        }

        const recordId = recordData.id;

        // Insert Party
        const partyData = rec.party.map(p => {
            const char = findChar(p.name);
            if (!char) {
                console.warn(`Character ${p.name} not found in DB, skipping member.`);
                return null;
            }
            return {
                record_id: recordId,
                character_id: char.id,
                role: p.role,
                constellation: p.constellation
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
