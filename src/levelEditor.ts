import {cyrb53, initGrid} from "./util.ts";
import {arrayToCoordinate, Coordinates, Directions, Field, FieldType} from "./field.ts";
import {Droppable, DroppableStopEvent} from "@shopify/draggable"
import {convertToJSON, LevelType} from "./levels.ts";
import {Level} from "./level.ts";

export class LevelEditor {
    private size: number = 5;
    private playMode: boolean = false;
    declare private droppable: Droppable;
    declare private level: Level;
    private readonly originalUI: HTMLElement;
    declare private levelData: LevelType;

    private constructor() {
        console.log("Level editor initialized");
        this.originalUI = this.cloneElement('levelEditor');
        this.addEventListenerToAll('.cell', 'contextmenu', this.contextMenuListener.bind(this));
        document.addEventListener('keyup', this.keyPressListener.bind(this))
    }

    public static init(): LevelEditor {
        console.log("Level editor initializing...");
        initGrid(5);
        this.addClassToAll('.cell', 'dropCell');
        const instance = new LevelEditor();
        instance.initDroppable();
        instance.showUI();
        return instance;
    }

    private contextMenuListener(event: Event, element: Element) {
        event.preventDefault();
        const coordinates = arrayToCoordinate(this.splitIdToNumberArray(element.id));
        this.initPlayMode(coordinates);
    }

    private keyPressListener(event: KeyboardEvent) {
        if (event.key == 'Tab' && this.playMode) {
            this.playMode = false;
            event.preventDefault()
            this.level.removeListener()
            // Tab back into edit mode
            this.clearUI()
            initGrid(this.size);
            LevelEditor.addClassToAll('.cell', 'dropCell');
            this.initDroppable();
            this.showUI();
            this.levelData.fields(true)
            this.addEventListenerToAll('.cell', 'contextmenu', this.contextMenuListener.bind(this));
        }
    }

    private cloneElement(elementId: string): HTMLElement {
        return document.getElementById(elementId)!.cloneNode(true) as HTMLElement;
    }

    private addEventListenerToAll(querySelectorString: string, eventString: string, callback: (event: Event, element: Element) => void) {
        document.querySelectorAll(querySelectorString).forEach(element => {
            element.addEventListener(eventString, (event) => callback(event, element))
        });
    }

    private static addClassToAll(querySelectorString: string, className: string) {
        document.querySelectorAll(querySelectorString).forEach(element => (element as HTMLDivElement).classList.add(className));
    }

    private splitIdToNumberArray(id: string): number[] {
        return id.split('x').map(value => parseInt(value));
    }

    private initDroppable() {
        if (this.droppable) {
            this.droppable.destroy();
        }
        this.droppable = new Droppable(document.querySelectorAll('main'), {
            draggable: '.dragCell',
            dropzone: '.dropCell',
            mirror: {
                constrainDimensions: true,
                appendTo: 'main'
            }
        });
        this.droppable.on('droppable:stop', this.onDrop.bind(this));
        this.droppable.on('droppable:start', this.onStart.bind(this));
    }

    private onStart(event: any) {
        event.dragEvent.mirror.style.zIndex = '1000';
    }

    private onDrop(event: DroppableStopEvent) {
        let originalCell = event.dragEvent.source as HTMLDivElement
        let copy = originalCell.cloneNode(true) as HTMLDivElement
        let parent = originalCell.parentElement as HTMLDivElement
        if (parent.classList.contains('ediDrop')) {
            return
        }
        //parent.innerHTML = ''
        if (parent.dataset.type) {
            parent.classList.remove(parent.dataset.type)
        }
        parent.dataset.type = originalCell.dataset.type
        parent.classList.add(originalCell.dataset.type!)
        parent.replaceChildren(...originalCell.children)
        document.querySelector('.dropCell.ediDrop')?.appendChild(copy)
        originalCell.remove()
        event.dragEvent.originalSource.remove()
        document.querySelectorAll('.draggable-dropzone--occupied').forEach(element => {
            let el = element as HTMLDivElement
            el.classList.remove('draggable-dropzone--occupied')
        })
    }

    private initPlayMode(startCoords : Coordinates) {
        this.playMode = true;
        document.querySelectorAll('.dropCell').forEach(element => {
            let el = element as HTMLDivElement
            el.classList.remove('dropCell')
        })
        document.querySelectorAll('.dragCell').forEach(element => {
            let el = element as HTMLDivElement
            el.classList.remove('dragCell')
        })
        this.droppable.destroy()

        this.getLevelData(startCoords)

        this.clearUI()
        this.level = new Level(this.levelData)
        this.level.customOnBeat = () => {
            this.playMode = false;
            this.level.removeListener()
            this.clearUI()
            initGrid(this.size);
            LevelEditor.addClassToAll('.cell', 'dropCell');
            this.initDroppable();
            this.showUI();
            this.levelData.fields(true)
            this.addEventListenerToAll('.cell', 'contextmenu', this.contextMenuListener.bind(this));
            let saveDialog = document.getElementById('saveDialog') as HTMLDivElement
            saveDialog.style.display = 'flex'
            saveDialog.style.visibility = 'visible'
            let saveButton = document.getElementById('saveButton') as HTMLButtonElement
            let cancelButton = document.getElementById('cancelButton') as HTMLButtonElement
            saveButton.onclick = () => {
                console.log("Click")
                this.saveLevel()
                saveDialog.style.display = 'none'
                saveDialog.style.visibility = 'hidden'
            }
            cancelButton.onclick = () => {
                saveDialog.style.display = 'none'
                saveDialog.style.visibility = 'hidden'
            }
        }
    }

    private getLevelData(startCoords: Coordinates) : LevelType {
        let fieldArray: Field[] = []
        document.querySelectorAll('.cell').forEach(element => {
            let el = element as HTMLDivElement
            let coordinates = el.id.split('x').map(value => parseInt(value))
            let fieldType: FieldType
            if (el.dataset.type == undefined || el.dataset.type == "undefined") {
                fieldType = 'normal'
            } else {
                fieldType = el.dataset.type as FieldType
            }
            let directions: Coordinates[] = []
            el.querySelectorAll('.arrow').forEach(element => {
                let arrow = element as HTMLDivElement
                let direction = arrow.classList[1].split('w')[1].split('_').map(value => parseInt(value))
                directions.push({x: direction[0], y: direction[1]})
            })
            let field = new Field({x: coordinates[0], y: coordinates[1]}, directions, fieldType)
            fieldArray.push(field)
        })

        this.levelData = {
            name: "",
            size: this.size,
            start: startCoords,
            id: -1,
            fields: (): Field[] => {
                return fieldArray.map(field => {
                    return new Field(field.getCoordinates(), field.getDirections(), field.getType())
                })
            }
        }

        return this.levelData
    }


    private showUI() {
        document.getElementById('level')!.innerText = 'Editor'
        document.querySelectorAll('.game-ui').forEach(element => {
            let el = element as HTMLDivElement
            el.style.display = 'none'
            el.style.visibility = 'hidden'
        })

        const arrowSelect = document.getElementById('arrowSelect') as HTMLDivElement
        for (let i = 0; i < 9; i++) {
            if (i === 4) {
                let br = document.createElement('br')
                arrowSelect.appendChild(br)
                continue
            }
            let vec = this.mapDirection(i)
            let checkbox = document.createElement('input')
            checkbox.type = 'checkbox'
            checkbox.id = `arrow${i}`
            checkbox.dataset.direction = `${vec.x},${vec.y}`
            checkbox.classList.add('arrowCheckbox')
            checkbox.checked = false
            checkbox.onchange = () => {
                let previewCell = document.querySelector('.dropCell.ediDrop .editorCell') as HTMLDivElement
                if (checkbox.checked) {
                    let arr = document.createElement('div')
                    arr.classList.add('arrow')
                    arr.classList.add(`arrow${vec.x}_${vec.y}`)
                    previewCell.appendChild(arr)
                } else {
                    let arr = document.querySelector(`.dropCell.ediDrop .editorCell .arrow${vec.x}_${vec.y}`)
                    previewCell.removeChild(arr!)
                }
            }
            arrowSelect.appendChild(checkbox)

        }

        let radios = document.querySelectorAll('#typeSelect input')
        radios.forEach(radio => {
            radio.addEventListener('change', () => {
                let previewCell = document.querySelector('.dropCell.ediDrop .editorCell') as HTMLDivElement
                if (previewCell.dataset.type) {
                    previewCell.classList.remove(previewCell.dataset.type)
                }
                let type = (document.querySelector('#typeSelect input:checked') as HTMLInputElement).value
                previewCell.dataset.type = type
                previewCell.classList.add(type)
            })
        })

        document.getElementById('levelEditor')!.style.display = 'flex'
        document.getElementById('levelEditor')!.style.visibility = 'visible'

        this.registerLevelEditorListeners()
    }

    clearUI() {
        document.getElementById('levelEditor')!.innerHTML = ''
        document.getElementById('levelEditor')!.replaceWith(this.originalUI.cloneNode(true))
        this.deregisterLevelEditorListeners()
        document.querySelectorAll('.game-ui').forEach(element => {
            let el = element as HTMLDivElement
            el.style.display = 'block'
            el.style.visibility = 'visible'
        })
    }

    private registerLevelEditorListeners() : void {
        if (this.size) (document.getElementById('size') as HTMLInputElement).value = String(this.size);
        document.getElementById('size')!.onchange = () => {
            let size = parseInt((document.getElementById('size') as HTMLInputElement).value);
            initGrid(size);
            this.size = size;
            LevelEditor.addClassToAll('.cell', 'dropCell');
            this.initDroppable();
            this.addEventListenerToAll('.cell', 'contextmenu', this.contextMenuListener.bind(this));
        };
    }

    private deregisterLevelEditorListeners() {
        document.getElementById('size')!.onchange = null
    }

    private mapDirection(num: number) {
        let vec
        switch (num % 9) {
            case 0:
                vec = Directions.ul
                break
            case 1:
                vec = Directions.u
                break
            case 2:
                vec = Directions.ur
                break
            case 3:
                vec = Directions.l
                break
            case 5:
                vec = Directions.r
                break
            case 6:
                vec = Directions.dl
                break
            case 7:
                vec = Directions.d
                break
            case 8:
                vec = Directions.dr
                break
        }
        return vec!!
    }

    private saveLevel() {
        console.log("Saving level")
        this.levelData.name = (document.getElementById('saveName') as HTMLInputElement).value
        this.levelData.id = Math.floor(Math.random() * 100000000000000)
        let formData = new FormData()
        let levelJson = convertToJSON(this.levelData)
        formData.append('level', JSON.stringify(levelJson))
        let password = (document.getElementById('password') as HTMLInputElement).value
        let hashedPassword = cyrb53(password)
        formData.append('password', hashedPassword.toString())
        fetch('/php/edit.php', {
            method: 'POST',
            body: formData,
        }).then(r => r.text()).then(r => console.log(r))
    }
}