/**
 * Shuffles an array in place.
 * Credit to this page: https://javascript.info/task/shuffle
 */
export function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/** Random integer in [min, max) */
export function randInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
