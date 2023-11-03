import './style.css'
import {Game} from "./game.ts";

//const root = document.getElementById('root')!

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

/*let level = Levels[1]
console.log(convertToJSON(level))

let formData = new FormData()
formData.append('level', JSON.stringify(convertToJSON(level)))

fetch('/php/edit.php', {
    method: 'POST',
    body: formData,
}).then(r => r.text()).then(r => console.log(r))*/