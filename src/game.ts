import {Level} from "./level.ts";
import {LevelEditor} from "./levelEditor.ts";
import {amountOfLevels} from "./levels.ts";

const PASSWORD_HASH = "b109f3bbbc244eb82441917ed06d618b9008dd09b3befd1b5e07394c706a8bb980b1d7785e5976ec049b46df5f1326af5a2ea6d103fd07c95385ffab0cacbc86";

export class Game {
    private _currentLevel: Level;
    private _currentLevelNumber: number = 0;
    private _levelEditor?: LevelEditor;

    constructor() {
        this._currentLevel = new Level(this._currentLevelNumber);
    }

    set currentLevel(value: number) {
        const beatenLevels = this.getBeatenLevels();

        if (!this.isLevelAccessible(value, beatenLevels) || this.isLevelExceedsTotal(value)) {
            return;
        }

        this._currentLevel.removeListener();
        this._currentLevelNumber = value;

        if (this.isLevelEditorMode(value)) {
            this.openPasswordDialog();
            return;
        }

        if (this._levelEditor) {
            this.cleanLevelEditor();
        }

        this._currentLevel = new Level(value);
    }

    private openPasswordDialog() {
        let dia = document.getElementById('passwordDialog')! as HTMLDivElement;
        dia.style.display = 'flex';
        dia.style.visibility = 'visible';

        let input = document.getElementById('password')! as HTMLInputElement;

        let button = document.getElementById('passwordButton')! as HTMLButtonElement;
        button.onclick = () => {
            crypto.subtle.digest('SHA-512', new TextEncoder().encode(input.value)).then((hash) => {
                let hashed = Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
                if (hashed === PASSWORD_HASH) {
                    console.log("Password correct");
                    this.initializeLevelEditor();
                    dia.style.display = 'none';
                    dia.style.visibility = 'hidden';
                    input.value = '';
                } else {
                    console.log("Password incorrect");
                    input.value = '';
                    this._currentLevelNumber = 0;
                    dia.style.display = 'none';
                    dia.style.visibility = 'hidden';
                }
            })
        }

        document.getElementById('cancelPasswordButton')!.onclick = () => {
            this._currentLevelNumber = 0;
            dia.style.display = 'none';
            dia.style.visibility = 'hidden';
        }
    }

    get currentLevel(): number {
        return this._currentLevelNumber;
    }

    get currentLevelName(): string {
        return this._currentLevel.name;
    }

    private isLevelAccessible(value: number, beatenLevels: number[]): boolean {
        if (value < 0) return true;
        return value === 0 || beatenLevels.includes(value - 1);
    }

    private isLevelExceedsTotal(value: number): boolean {
        return value >= amountOfLevels;
    }

    private isLevelEditorMode(value: number): boolean {
        return value < 0;
    }

    private getBeatenLevels(): number[] {
        try {
            return JSON.parse(localStorage.getItem('beatenLevels')!) || [];
        } catch (e) {
            // Handle logging here
            return [];
        }
    }

    private initializeLevelEditor(): void {
        if (!this._levelEditor) {
            this._levelEditor = LevelEditor.init();
        }
    }

    private cleanLevelEditor(): void {
        this._levelEditor!.clearUI();
        this._levelEditor = undefined;
    }
}