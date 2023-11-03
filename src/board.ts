import {Coordinates, Field} from "./field.ts";
import {LevelType} from "./levels.ts";

export class Board {
    private fields: Field[] = []
    declare currentField: Field
    level: LevelType

    constructor(level: LevelType) {
        this.level = level;
        this.initializeFields();
    }

    private initializeFields() {
        this.fields = this.level.fields(true);
        this.setCurrentField(this.level.start);
    }

    private setCurrentField(coordinates: Coordinates) {
        if (this.currentField) {
            this.currentField.getHtmlElement().classList.remove('active');
        }
        this.currentField = this.fields[coordinates.x + coordinates.y * this.level.size];
        const htmlElement = this.currentField.getHtmlElement();
        htmlElement.classList.add('active');
        htmlElement.style.backgroundColor = '';
    }

    getCurrentlyPossibleSteps(stepSize: number): Coordinates[] {
        return this.currentField.getPossibleSteps(stepSize);
    }

    move(coordinates: Coordinates) {
        this.setCurrentField(coordinates);
    }

    reset() {
        this.initializeFields();
    }
}