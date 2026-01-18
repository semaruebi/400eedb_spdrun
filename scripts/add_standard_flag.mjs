/**
 * 恒常武器・キャラに isStandard フラグを追加するスクリプト
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 恒常武器リスト（日本語名）
const STANDARD_WEAPONS_JP = [
    '風鷹剣',      // Aquila Favonia
    '天空の刃',    // Skyward Blade
    '天空の傲',    // Skyward Pride
    '狼の末路',    // Wolf's Gravestone
    '和璞鳶',      // Primordial Jade Winged-Spear
    '天空の脊',    // Skyward Spine
    '天空の巻',    // Skyward Atlas
    '四風原典',    // Lost Prayer to the Sacred Winds
    '天空の翼',    // Skyward Harp
    'アモスの弓',  // Amos' Bow
];

// 恒常キャラリスト（日本語名 → 英語名）
const STANDARD_CHARACTERS_EN = [
    'Yumemizuki Mizuki',  // 夢見月瑞希
    'Dehya',              // ディシア
    'Keqing',             // 刻晴
    'Mona',               // モナ
    'Jean',               // ジン
    'Tighnari',           // ティナリ
    'Diluc',              // ディルック
    'Qiqi',               // 七七
];

async function main() {
    // 武器データを更新
    const weaponPath = path.join(__dirname, '..', 'src', 'data', 'weapon_full_data.json');
    const weaponData = JSON.parse(fs.readFileSync(weaponPath, 'utf-8'));

    let weaponCount = 0;
    for (const [name, data] of Object.entries(weaponData)) {
        // 星5のみ対象
        if (data.rarity === 5) {
            const isStandard = STANDARD_WEAPONS_JP.includes(data.nameJp);
            weaponData[name].isStandard = isStandard;
            if (isStandard) weaponCount++;
        }
    }

    fs.writeFileSync(weaponPath, JSON.stringify(weaponData, null, 2) + '\n');
    console.log(`武器データ更新完了: ${weaponCount}個の恒常武器をマーク`);

    // キャラデータを更新
    const charPath = path.join(__dirname, '..', 'src', 'data', 'character_full_data.json');
    const charData = JSON.parse(fs.readFileSync(charPath, 'utf-8'));

    let charCount = 0;
    for (const [name, data] of Object.entries(charData)) {
        // 英語名で判定
        const isStandard = STANDARD_CHARACTERS_EN.includes(name);
        charData[name].isStandard = isStandard;
        if (isStandard) charCount++;
    }

    fs.writeFileSync(charPath, JSON.stringify(charData, null, 2) + '\n');
    console.log(`キャラデータ更新完了: ${charCount}人の恒常キャラをマーク`);
}

main();
