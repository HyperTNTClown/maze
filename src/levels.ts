import {Coordinates, Direction, Directions, Field, FieldType} from "./field.ts";

export type LevelType = {
    name: string;
    size: number;
    id: number;
    start: Coordinates;
    max_steps: number
    fields: (b: boolean) => Field[];
}

export type FieldJSON = {
    coordinates: Coordinates;
    directions: Direction[] | string[];
    type: string;
}

export type LevelJSON = {
    name: string;
    size: number;
    id: number;
    max_steps: number;
    start: Coordinates;
    fields: FieldJSON[];
}

export let amountOfLevels = 2;

export const fetchLevels = async (): Promise<LevelType[]> => {
    const response = await fetch('levels.json');
    const json: {levels: LevelJSON[]} = await response.json();
    const levels: LevelType[] = json.levels.map(convertToLevelType);
    amountOfLevels = levels.length;

    return levels;
}

export const convertToLevelType = (json: LevelJSON): LevelType => (
    {
    ...json,
    fields: (b = true) =>
        json.fields.map(({ coordinates, directions, type }): Field => {
            let direction = directions.map((direction) => Directions[direction as Direction]);
            //console.log(json.fields)
            // @ts-ignore
            if (direction == [undefined]) {
                direction = [];
            }
            return new Field(
                    coordinates,
                    directions.map((direction) => Directions[direction as Direction]),
                    type as FieldType,
                    b
                )
            }
        )
});

export const convertToJSON = (level: LevelType): LevelJSON => {
    let json : LevelJSON = {
        ...level,
        fields: level.fields(false).map((field): FieldJSON => ({
            coordinates: field.getCoordinates(),
            // @ts-ignore
            directions: field.getDirections().map((direction): Direction | undefined => Field.directionsToDirection(direction)).filter((direction) => direction !== undefined),
            type: field.getType(),
        }))
    }

    json.max_steps = solve_level(json);
    return json
};

type State = [Coordinates, number, number]

const solve_level = (level: LevelJSON): number => {
    const size = level.size;
    const start = level.start;
    const fields = level.fields;

    const visited: boolean[][][] =
        new Array(size).fill(0).map(() =>
            new Array(size).fill(0).map(() =>
                new Array(size).fill(false)));

    let queue: State[] = [];
    queue.push([start, 1, 0])

    while (queue.length > 0) {
        let [current, stepSize, stepCount] = queue.shift() as State;
        if (visited[current.x][current.y][stepSize]) {
            continue
        }
        visited[current.x][current.y][stepSize] = true;
        let currentField =
            fields.find(field =>
                field.coordinates.x == current.x &&
                field.coordinates.y == current.y
            )!;

        let finished = false;

        let directions = currentField.directions.map((direction) => Directions[direction as Direction])
        directions.forEach((dir) => {
            let next_coords = {
                x: current.x + (dir.x * stepSize),
                y: current.y + (dir.y * -stepSize)
            }
            let next_stepSize = stepSize;

            if ((next_coords.x < 0 || next_coords.x >= size || next_coords.y < 0 || next_coords.y >= size)) {
                return
            }

            let nextField =
                fields.find(field =>
                    field.coordinates.x == next_coords.x &&
                    field.coordinates.y == next_coords.y
                );

            if (nextField?.type == "stepAdd") {
                next_stepSize++;
            }
            if (nextField?.type == "stepRem") {
                next_stepSize--;
            }
            if (next_stepSize < 1) {
                return
            }

            if (nextField!!.type == "goal") {
                finished = true
                return stepCount + 1;
            }

            queue.push([next_coords, next_stepSize, stepCount + 1]);
        })

        if (finished) {
            return stepCount + 1;
        }

    }

    return -1;

}