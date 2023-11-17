import './style.css'
import {Game} from "./game.ts";
import anime from "animejs";

if (localStorage.getItem('beatenLevels') === null) {
    localStorage.setItem('beatenLevels', JSON.stringify([-1]))
}

export const game = new Game()

let timeout : number = 0;

document.addEventListener("keyup", (e) => {
    if (e.key == "h") showHelp()
})

const showHelp = () => {
    let diag = document.getElementById("finishDialog")!
    let span = document.createElement("span")
    span.innerText = "Try to reach the goal in the minimum amount of steps.\n" +
        "Red Arrows increase your stepsize by 1.\n" +
        "Yellow Arrows decrease it by 1."
    diag.replaceChildren(span)
    anime({
        targets: '#finishDialog',
        opacity: 1,
        duration: 250,
        easing: 'easeInOutSine',
        direction: 'forwards'
    });

    clearTimeout(timeout)
    timeout = setTimeout(() => {
        anime({
            targets: '#finishDialog',
            opacity: 0,
            duration: 250,
            easing: 'easeInOutSine',
            direction: 'forwards'
        });
    }, 5000)
}

showHelp()