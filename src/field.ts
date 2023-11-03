import './arrows.css'

export type Coordinates = {
    x: number,
    y: number
}

export const arrayToCoordinate = (coords: number[]): Coordinates => {
    return {x: coords[0], y: coords[1]}
}

export enum Direction {
    u = 'u',
    d = 'd',
    l = 'l',
    r = 'r',
    ur = 'ur',
    ul = 'ul',
    dr = 'dr',
    dl = 'dl'
}

export const Directions = {
    u: {x: 0, y: 1},
    d: {x: 0, y: -1},
    l: {x: -1, y: 0},
    r: {x: 1, y: 0},
    ur: {x: 1, y: 1},
    ul: {x: -1, y: 1},
    dr: {x: 1, y: -1},
    dl: {x: -1, y: -1}
}

export type FieldType = 'normal' | 'stepAdd' | 'stepRem' | 'goal'

export class Field {

    coordinates: Coordinates
    directions: Coordinates[]
    type: FieldType
    ref: HTMLDivElement | undefined

    constructor(coordinates: Coordinates, directions: Coordinates[], type: FieldType, init: boolean = true) {
        this.coordinates = coordinates
        this.directions = directions
        this.type = type
        if (init) {
            this.ref = document.getElementById(`${coordinates.x}x${coordinates.y}`) as HTMLDivElement
            this.ref.classList.add(type)
            this.ref.dataset.type = type
            this.drawDirections()
        }
    }

    getCoordinates(): Coordinates {
        return this.coordinates
    }

    getDirections(): Coordinates[] {
        return this.directions
    }

    getType(): FieldType {
        return this.type
    }

    getHtmlElement(): HTMLDivElement {
        return this.ref!
    }

    getPossibleSteps(stepSize: number = 1): Coordinates[] {
        return this.directions.map(direction => {
            if (direction == undefined) null
            return {
                x: this.coordinates.x + direction.x * stepSize,
                y: this.coordinates.y + direction.y * -stepSize
            }
        })
    }

    private drawDirections() {
        this.ref!.innerHTML = ''
        this.directions.forEach(direction => {
            if (direction == undefined) return
            const arrow = document.createElement('div')
            arrow.classList.add('arrow')
            arrow.classList.add(`arrow${direction.x}_${direction.y}`)
            this.ref!.appendChild(arrow)
        })
    }

    public static directionsToDirection(direction: Coordinates) {
        if (direction.x === 0 && direction.y === 1) return Direction.u
        if (direction.x === 0 && direction.y === -1) return Direction.d
        if (direction.x === -1 && direction.y === 0) return Direction.l
        if (direction.x === 1 && direction.y === 0) return Direction.r
        if (direction.x === 1 && direction.y === 1) return Direction.ur
        if (direction.x === -1 && direction.y === 1) return Direction.ul
        if (direction.x === 1 && direction.y === -1) return Direction.dr
        if (direction.x === -1 && direction.y === -1) return Direction.dl
        return undefined
    }
}