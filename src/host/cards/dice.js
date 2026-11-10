/**
 * Dice. Card numbers are written like you'd say them at a table:
 * '2d6', '1d6+3', or just '4' for a flat amount.
 */

export function d6() {
    return 1 + Math.floor(Math.random() * 6);
}

/**
 * Rolls a dice spec. Returns { spec, dice, bonus, total } so the table can
 * show what came up.
 */
export function roll(spec) {
    const text = String(spec).replace(/\s/g, '');
    const match = text.match(/^(\d*)d(\d+)([+-]\d+)?$/);
    if (!match) {
        const flat = Number(text);
        if (Number.isNaN(flat)) throw new Error(`Can't roll "${spec}"`);
        return { spec: text, dice: [], bonus: flat, total: flat };
    }
    const count = Number(match[1] || 1);
    const sides = Number(match[2]);
    const bonus = Number(match[3] || 0);
    const dice = [];
    for (let i = 0; i < count; i++) dice.push(1 + Math.floor(Math.random() * sides));
    return { spec: text, dice, bonus, total: dice.reduce((a, b) => a + b, 0) + bonus };
}

/** The lowest and highest a spec can roll, for card text and bots */
export function range(spec) {
    const text = String(spec).replace(/\s/g, '');
    const match = text.match(/^(\d*)d(\d+)([+-]\d+)?$/);
    if (!match) return [Number(text), Number(text)];
    const count = Number(match[1] || 1);
    const bonus = Number(match[3] || 0);
    return [count + bonus, count * Number(match[2]) + bonus];
}

/** The average roll of a spec */
export function average(spec) {
    const [lo, hi] = range(spec);
    return (lo + hi) / 2;
}
