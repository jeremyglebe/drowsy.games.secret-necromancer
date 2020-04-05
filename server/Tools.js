/**
 * Function swaps the keys and values of an object and returns it.
 * Credit to Garrett on StackOverflow:
 * https://stackoverflow.com/questions/23013573/swap-key-with-value-json
 * @param obj Any key-value json object
 */
function reverseObject(obj) {
    const entrySet = Object.entries(obj);
    const reversed = entrySet.map(([k, v]) => [v, k]);
    const result = Object.fromEntries(reversed);
    return result;
}

/**
 * Shuffles an array of objects.
 * Credit to this page:
 * https://javascript.info/task/shuffle
 */
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

module.exports = {
    reverseObject: reverseObject,
    shuffle: shuffle
}