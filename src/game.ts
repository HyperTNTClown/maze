import {Level} from "./level.ts";
import {amountOfLevels} from "./levels.ts";


export class Game {
    private _currentLevel: Level;
    private _currentLevelNumber: number = 0;

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

        this._currentLevel = new Level(value);
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

    private getBeatenLevels(): number[] {
        try {
            return JSON.parse(localStorage.getItem('beatenLevels')!) || [];
        } catch (e) {
            // Handle logging here
            return [];
        }
    }
}