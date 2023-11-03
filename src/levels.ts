import {Coordinates, Direction, Directions, Field, FieldType} from "./field.ts";

export type LevelType = {
    name: string;
    size: number;
    id: number;
    start: Coordinates;
    fields: (b: boolean) => Field[];
}

export type FieldJSON = {
    coordinates: Coordinates;
    directions: Direction[];
    type: string;
}

export type LevelJSON = {
    name: string;
    size: number;
    id: number;
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
            let direction = directions.map((direction) => Directions[direction]);
            //console.log(json.fields)
            // @ts-ignore
            if (direction == [undefined]) {
                direction = [];
            }
            return new Field(
                    coordinates,
                    directions.map((direction) => Directions[direction]),
                    type as FieldType,
                    b
                )
            }
        )
});

export const convertToJSON = (level: LevelType): LevelJSON => ({
    ...level,
    fields: level.fields(false).map((field) : FieldJSON => ({
        coordinates: field.getCoordinates(),
        // @ts-ignore
        directions: field.getDirections().map((direction) : Direction | undefined => Field.directionsToDirection(direction)).filter((direction) => direction !== undefined),
        type: field.getType(),
    }))
});