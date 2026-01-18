/**
 * 全データを更新するスクリプト
 * 
 * 1. 武器データ更新 (update_weapons.mjs)
 * 2. キャラデータ更新 (update_characters.mjs)
 * 3. 恒常フラグ追加 (add_standard_flag.mjs)
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const scripts = [
    'update_weapons.mjs',
    'update_characters.mjs',
    'add_standard_flag.mjs'
];

async function runScript(scriptName) {
    return new Promise((resolve, reject) => {
        console.log(`\n=== Running ${scriptName} ===`);
        const scriptPath = path.join(__dirname, scriptName);

        // Windows環境(pwsh)を考慮して実行
        const process = spawn('node', [scriptPath], {
            stdio: 'inherit',
            shell: true
        });

        process.on('close', (code) => {
            if (code === 0) {
                console.log(`=== ${scriptName} completed successfully ===`);
                resolve();
            } else {
                console.error(`=== ${scriptName} failed with code ${code} ===`);
                reject(new Error(`${scriptName} failed`));
            }
        });
    });
}

async function main() {
    try {
        for (const script of scripts) {
            await runScript(script);
        }
        console.log('\n✨ All data updated successfully! ✨');
    } catch (error) {
        console.error('\n❌ Data update failed:', error);
        process.exit(1);
    }
}

main();
