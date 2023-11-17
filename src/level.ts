import {Board} from "./board.ts";
import {amountOfLevels, fetchLevels, LevelType} from "./levels.ts";
import anime from "animejs";
import {arrayToCoordinate} from "./field.ts";
import {initGrid} from "./util.ts";
import {game} from "./main.ts";

export class Level {
    private board: Board | undefined;
    private currentStepSize = 1;
    private currentStepCount = 0;
    name = "Level";
    private id: number | undefined;
    private beat = false;
    private maxSteps = 0;

    constructor(level: number | LevelType) {
        this.populateLevel(level);
        this.registerEventListeners();
    }

    private populateLevel(level: number | LevelType) {
        if (typeof level === 'number') {
            fetchLevels().then((value) => {
                this.gridInitialization(value[level]);
                this.board = new Board(value[level]);
                this.name = value[level].name;
                this.id = level;
                this.maxSteps = value[level].max_steps;
                this.displayLevelName();
            });
        } else {
            this.gridInitialization(level);
            this.board = new Board(level);
            this.name = level.name;
            this.id = level.id;
            this.maxSteps = level.max_steps;
            this.displayLevelName();
        }
    }

    private registerEventListeners() {
        document.addEventListener('keypress', this.listener);
        this.displayStepDetails();
    }

    private displayLevelName() {
        document.getElementById('level')!.innerText = this.name;
    }

    private displayStepDetails() {
        document.getElementById('stepSize')!.innerText = String(this.currentStepSize);
        document.getElementById('stepCount')!.innerText = String(this.currentStepCount);
    }

    private gridInitialization(level: LevelType) {
        initGrid(level.size, (event) => this.onClick(event, this.board!));
    }

    removeListener() {
        document.removeEventListener('keypress', this.listener);
    }

    listener = (event: KeyboardEvent) => {
        if (event.repeat) return;
        if (event.key === ' ') this.flashPossibleSteps();
        if (event.key === 'r') this.resetLevel();
    }

    private resetLevel() {
        if (this.beat) this.rescaleCells();
        this.board!.reset();
        this.currentStepSize = 1;
        this.currentStepCount = 0;
        this.displayStepDetails();
        document.getElementById("finishDialog")!.style.opacity = "0"
    }

    private rescaleCells() {
        anime({
            targets: '.cell',
            opacity: 1,
            backgroundColor: '#1A1A1A',
            duration: 250,
            easing: 'easeInOutSine',
            delay: anime.stagger(75, {
                grid: [this.board!.level.size, this.board!.level.size],
                from: 'center'
            })
        });
        setTimeout(() => {
            document.querySelectorAll('.cell').forEach(cell => (cell as HTMLDivElement).style.backgroundColor = '')
        }, 300)
    }

    private flashPossibleSteps() {
        let fieldIDs = this.getPossibleStepIDs();
        this.animatePossibleSteps(fieldIDs as HTMLElement[]);
    }

    private getPossibleStepIDs() {
        return this.board!.currentField.getPossibleSteps(this.currentStepSize).map(coordinates =>
            coordinates.x + 'x' + coordinates.y).map(id => document.getElementById(id)).filter(val => val != null);
    }

    private animatePossibleSteps(fieldIDs: Element[]) {
        anime({
            targets: fieldIDs,
            backgroundColor: ['#ffc400', '#1A1A1A'],
            duration: 250,
            easing: 'easeOutInBounce',
            direction: 'forwards'
        });
    }

    addToCurrentStepSize(value: number) {
        this.currentStepSize += value;
        document.getElementById('stepSize')!.innerText = String(this.currentStepSize);
    }

    incrementSteps() {
        this.currentStepCount++;
        document.getElementById('stepCount')!.innerText = String(this.currentStepCount);
    }

    onClick(event: MouseEvent, board: Board) {
        let stepCoordinates = this.getStepCoordinatesFromClick(event, board);
        stepCoordinates ? this.handleValidMove(stepCoordinates) : this.handleInvalidMove(event);
    }

    private getStepCoordinatesFromClick(event: MouseEvent, board: Board) {
        let coordinates = this.getCoordinatesFromEvent(event);
        let possibleSteps = board.getCurrentlyPossibleSteps(this.currentStepSize);
        return possibleSteps.find(val => val.x === coordinates.x && val.y === coordinates.y);
    }

    private getCoordinatesFromEvent(event: MouseEvent) {
        let field = event.target as HTMLDivElement;
        return arrayToCoordinate(field.id.split('x').map(value => Number(value)));
    }

    private handleValidMove(stepCoordinates: { x: number, y: number }) {
        this.board!.move(stepCoordinates);
        this.incrementSteps();
        switch (this.board!.currentField.getType()) {
            case 'stepAdd':
                this.addToCurrentStepSize(1);
                break;
            case 'stepRem':
                this.addToCurrentStepSize(-1);
                break;
            case 'goal':
                this.completeLevel();
                break;
        }
    }

    private handleInvalidMove(event: MouseEvent) {
        let field = event.target as HTMLDivElement;
        this.animateInvalidMove(field);
    }

    private animateInvalidMove(field: HTMLDivElement) {
        anime({
            targets: field,
            backgroundColor: ['#1A1A1A', '#ff0000'],
            scale: [1, .8],
            duration: 125,
            easing: 'easeInOutElastic(1, .5)',
            direction: 'alternate'
        });
    }

    private completeLevel() {
        if (this.currentStepCount > this.maxSteps) {
            this.resetLevel()
            this.showTooManyStepsMessage()
            return
        }
        this.beat = true;
        this.registerCompletedLevel();
        this.animateLevelCompletion();
        this.customOnBeat();
    }

    private registerCompletedLevel() {
        let beatenLevels = JSON.parse(localStorage.getItem('beatenLevels')!);
        if (!beatenLevels.includes(this.id)) {
            beatenLevels.push(this.id);
            localStorage.setItem('beatenLevels', JSON.stringify(beatenLevels));
        }
    }

    private animateLevelCompletion() {
        anime({
            targets: '.cell',
            opacity: 0,
            backgroundColor: '#ffffff',
            duration: 1000,
            easing: 'easeInOutSine',
            delay: anime.stagger(75, {
                grid: [
                    Number(document.getElementById('root')!.dataset.size!),
                    Number(document.getElementById('root')!.dataset.size!)
                ],
                from: 'center'
            })
        });
    }


    public customOnBeat = () => {
        let diag = document.getElementById("finishDialog")!
        let span = document.createElement("span")
        if (game.currentLevel == (amountOfLevels - 1)) {
            span.innerText = "Congratulations!\n You beat the Game\n --PLACEHOLDERTEXT--"
        } else {
            span.innerText = `Congratulations!\n You used the minimum number of steps!\nWelcome to Level ${game.currentLevel+2}!`
        }
        diag.replaceChildren(span)
        anime({
            targets: '#finishDialog',
            opacity: 1,
            duration: 250,
            easing: 'easeInOutSine',
            direction: 'forwards'
        });
        if (game.currentLevel != (amountOfLevels -1)) {
            setTimeout(() => {
                anime({
                    targets: '#finishDialog',
                    opacity: 0,
                    duration: 250,
                    easing: 'easeInOutSine',
                    direction: 'forwards'
                });
            }, 2000)
            game.currentLevel++
        }
    }

    private showTooManyStepsMessage() {
        anime({
            targets: '#tooManySteps',
            opacity: 1,
            duration: 250,
            easing: 'easeInOutSine',
            direction: 'forwards'
        });
        setTimeout(() => {
            anime({
                targets: '#tooManySteps',
                opacity: 0,
                duration: 250,
                easing: 'easeInOutSine',
                direction: 'forwards'
            });
        }, 2000)
    }
}