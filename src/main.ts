import './style.css'
import {Game} from "./game.ts";

if (localStorage.getItem('beatenLevels') === null) {
    localStorage.setItem('beatenLevels', JSON.stringify([-1]))
}

const game = new Game()

document.getElementById('inc')!.onclick = () => {
    game.currentLevel++
}

document.getElementById('dec')!.onclick = () => {
    game.currentLevel--
}