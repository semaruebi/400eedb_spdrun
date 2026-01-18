import fs from 'fs';
import path from 'path';

// Data sources
const CHARACTERS_URL = 'https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/characters.json';
const LOC_URL = 'https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/loc.json';
const OUTPUT_PATH = path.join(process.cwd(), 'src/data/character_full_data.json');

// Convert API weapon type to simple type name
const WEAPON_TYPE_MAP = {
    'WEAPON_SWORD_ONE_HAND': 'Sword',
    'WEAPON_CLAYMORE': 'Claymore',
    'WEAPON_POLE': 'Polearm',
    'WEAPON_BOW': 'Bow',
    'WEAPON_CATALYST': 'Catalyst',
};

async function main() {
    console.log('Fetching character data from EnkaNetwork...');
    const charsRes = await fetch(CHARACTERS_URL);
    const charsData = await charsRes.json();

    console.log('Fetching localization data...');
    const locRes = await fetch(LOC_URL);
    const locData = await locRes.json();
    const enMap = locData.en;

    const characters = {};
    let count = 0;

    // Rarity map
    const RARITY_MAP = {
        'QUALITY_ORANGE': 5,
        'QUALITY_PURPLE': 4,
        'QUALITY_ORANGE_SP': 5
    };

    console.log('Processing characters...');
    for (const [id, charInfo] of Object.entries(charsData)) {
        const nameHash = charInfo.NameTextMapHash;
        const sideIcon = charInfo.SideIconName;
        const weaponType = WEAPON_TYPE_MAP[charInfo.WeaponType];

        // rarity
        const rarityStr = charInfo.QualityType;
        const rarity = RARITY_MAP[rarityStr] || 4; // Default to 4 if unknown

        if (!nameHash || !sideIcon || !weaponType) continue;

        const enName = enMap[nameHash];
        if (!enName) continue;

        // Skip Trial and Test characters
        if (enName.includes('Trial') || enName.includes('Test') || enName.includes('(Trial)')) continue;

        // Skip duplicates (some characters have multiple entries for different elements)
        if (characters[enName]) continue;

        characters[enName] = {
            icon: sideIcon,
            weaponType: weaponType,
            element: charInfo.Element,
            rarity: rarity
        };
        count++;
    }

    // Write combined character data
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(characters, null, 2));
    console.log(`Successfully generated character data at ${OUTPUT_PATH}`);
    console.log(`Total characters mapped: ${count}`);
}

main().catch(err => {
    console.error('Error updating character data:', err);
    process.exit(1);
});
