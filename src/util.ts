import anime from "animejs";

export function initGrid(size: number, onClick: ((event: MouseEvent) => void) | null = null): void {
    const root: HTMLElement = document.getElementById('root')!;

    root.innerHTML = '';
    root.dataset.size = String(size);
    root.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    root.style.gridTemplateRows = `repeat(${size}, 1fr)`;

    Array.from({ length: size * size }).forEach((_, i) => {
        const cell: HTMLDivElement = document.createElement('div');

        cell.setAttribute('class', 'cell');
        cell.dataset.id = String(i);
        cell.id = `${i % size}x${Math.floor(i / size)}`;
        cell.style.opacity = '0';

        if (onClick) {
            cell.addEventListener('click', onClick);
        }

        root.appendChild(cell);
    });

    anime({
        targets: '.cell',
        opacity: 1,
        duration: 1000,
        easing: 'easeInOutSine',
        delay: anime.stagger(75, { grid: [size, size], from: 'center' })
    });
}

export const cyrb53 = (str : string, seed = 0) : number => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for(let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};