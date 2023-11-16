import './style.css'
import {Game} from "./game.ts";

if (localStorage.getItem('beatenLevels') === null) {
    localStorage.setItem('beatenLevels', JSON.stringify([-1]))
}

export const game = new Game()