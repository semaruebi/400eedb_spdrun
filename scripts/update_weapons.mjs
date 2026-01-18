import fs from 'fs';
import path from 'path';

// Data sources
const WEAPONS_URL = 'https://gitlab.com/Dimbreath/AnimeGameData/-/raw/master/ExcelBinOutput/WeaponExcelConfigData.json';
const TEXT_MAP_EN_URL = 'https://gitlab.com/Dimbreath/AnimeGameData/-/raw/master/TextMap/TextMapEN.json';
const TEXT_MAP_JP_URL = 'https://gitlab.com/Dimbreath/AnimeGameData/-/raw/master/TextMap/TextMapJP.json';
const OUTPUT_PATH = path.join(process.cwd(), 'src/data/weapon_full_data.json');

// Convert API weapon type to simple type name
const WEAPON_TYPE_MAP = {
    'WEAPON_SWORD_ONE_HAND': 'Sword',
    'WEAPON_CLAYMORE': 'Claymore',
    'WEAPON_POLE': 'Polearm',
    'WEAPON_BOW': 'Bow',
    'WEAPON_CATALYST': 'Catalyst',
};

async function main() {
    console.log('Fetching weapons data from GitLab...');
    const weaponsRes = await fetch(WEAPONS_URL);
    const weaponsData = await weaponsRes.json();

    console.log('Fetching English text map...');
    const enRes = await fetch(TEXT_MAP_EN_URL);
    const enMap = await enRes.json();

    console.log('Fetching Japanese text map...');
    const jpRes = await fetch(TEXT_MAP_JP_URL);
    const jpMap = await jpRes.json();

    const weapons = {};
    let count = 0;

    console.log('Processing weapons...');
    for (const weapon of weaponsData) {
        const hash = String(weapon.nameTextMapHash);
        const icon = weapon.icon;
        const rarity = weapon.rankLevel;
        const weaponType = WEAPON_TYPE_MAP[weapon.weaponType];

        // Only include 4-star and 5-star weapons with valid type
        if (!hash || !icon || rarity < 4 || !weaponType) continue;

        const enName = enMap[hash];
        const jpName = jpMap[hash];

        if (enName) {
            weapons[enName] = {
                icon: icon,
                nameJp: jpName || enName,
                type: weaponType,
                rarity: rarity
            };
            count++;
        }
    }

    // Write combined weapon data
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(weapons, null, 2));
    console.log(`Successfully generated weapon data at ${OUTPUT_PATH}`);
    console.log(`Total 4-5 star weapons mapped: ${count}`);
}

main().catch(err => {
    console.error('Error updating weapon data:', err);
    process.exit(1);
});
