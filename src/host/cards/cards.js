/**
 * Every spell, item and dark art in the game. To add a card, add an entry
 * here (and its art in Boot.js). The effects are in effects.js.
 *
 *   type      'spell', 'item', 'necromancy' (Necromancer only), or 'encounter'
 *             (what an encounter does each round, never in a deck)
 *   target    how you play it: 'player' (drop on someone), 'any' (someone or
 *             yourself), 'self', 'table' (drop in the middle), 'dead' (drop on
 *             a corpse), or 'none' (dark arts with no victim)
 *   cost      mana
 *   perTurn   limit per turn, if any
 *   hitsEncounter  can be dropped on the encounter in the middle
 *   stats     for items: armor, dodge, focus
 *   count     how many are in the deck
 *   ai        hint for the bots: 'attack', 'heal', 'buff', 'ramp', 'disrupt'
 */

import {
    Target, Self, Others, Encounter, RandomPlayer,
    Damage, Heal, Discard, Steal, SkipTurn, AddIncome, DrainMana, Equip, Raise, Summon,
} from './effects.js';

export const CARDS = {

    /* Spells ---------------------------------------------------------- */

    'Bolt': {
        type: 'spell', target: 'player', cost: 1, perTurn: 1, hitsEncounter: true, count: 45, ai: 'attack',
        text: "Deal 2d6 damage to\na player (or the\nmonster). One Bolt\nper turn.",
        effects: [Damage(Target, '2d6', { dodgeable: true })],
    },
    'Fireball': {
        type: 'spell', target: 'table', cost: 2, count: 15, ai: 'attack',
        text: "Explosive! Deal 1d6\ndamage to every\nother player (and\nthe monster).",
        effects: [Damage([Others, Encounter], '1d6', { fire: true })],
    },
    'Healing Potion': {
        type: 'spell', target: 'any', cost: 2, count: 4, ai: 'heal',
        text: "Heal yourself or\nanother player for\n1d6+3.",
        effects: [Heal(Target, '1d6+3')],
    },
    'Freeze': {
        type: 'spell', target: 'player', cost: 3, count: 3, ai: 'disrupt',
        text: "Target player skips\ntheir next turn.",
        effects: [SkipTurn(Target)],
    },
    'Mana Crystal': {
        type: 'spell', target: 'self', cost: 0, count: 5, ai: 'ramp',
        text: "Free. You make 1\nmore mana every\nturn from now on.",
        effects: [AddIncome(Self, 1)],
    },
    'Loot': {
        type: 'spell', target: 'player', cost: 1, count: 4, ai: 'disrupt',
        text: "Steal a random card\nfrom another player.",
        effects: [Steal(Target)],
    },

    /* Equipment ------------------------------------------------------- */

    'Shield': {
        type: 'item', target: 'self', cost: 1, count: 8, ai: 'buff', stats: { armor: 1 },
        text: "Equip: block 1\ndamage from every\nhit. Stacks up to 3.",
        effects: [Equip()],
    },
    'Robe': {
        type: 'item', target: 'self', cost: 1, count: 6, ai: 'buff', stats: { dodge: 1 },
        text: "Equip: dodge Bolts\non a 6. Each extra\nRobe dodges on one\nmore (up to 3).",
        effects: [Equip()],
    },
    'Wand': {
        type: 'item', target: 'self', cost: 1, count: 6, ai: 'buff', stats: { focus: 2 },
        text: "Equip: your damage\nrolls get +2.\nStacks.",
        effects: [Equip()],
    },

    /* Dark arts ------------------------------------------------------- */

    'Witch Brew': {
        type: 'necromancy', target: 'player', cost: 1, count: 110,
        text: "Victim loses all\ntheir banked mana\nand 2 random cards.",
        effects: [DrainMana(Target), Discard(Target, 2)],
    },
    'Raise Dead': {
        type: 'necromancy', target: 'dead', cost: 2, count: 40,
        text: "A dead player comes\nback with half HP\nas your Thrall.",
        effects: [Raise(Target)],
    },
    'Eldritch Horror': {
        type: 'necromancy', target: 'none', cost: 3, count: 30,
        text: "Summon a monster to\nthe table. It mauls\nsomeone at random\nevery round.",
        effects: [Summon({ name: 'Eldritch Horror', image: 'horror', health: 20, card: 'Maul' })],
    },

    /* What encounters do ---------------------------------------------- */

    'Maul': {
        type: 'encounter', target: 'none',
        text: "Deal 3d6 damage to\nsomeone at random.",
        effects: [Damage(RandomPlayer, '3d6')],
    },
};

/** The old target names the client uses, by card target */
const TARGET_TYPES = { player: 'player', any: 'any', self: 'self', table: 'others', dead: 'dead', none: 'all' };

/**
 * A card as it travels around: plain data the client can read. The effects
 * stay here on the host and get looked up by name.
 */
export function makeCard(name) {
    const def = CARDS[name];
    if (!def) throw new Error(`No card named ${name}`);
    const card = {
        name,
        description: def.text,
        type: def.type,
        targetType: TARGET_TYPES[def.target],
        cost: def.cost ?? 0,
    };
    if (def.perTurn) {
        card.oncePerTurn = true;
        card.perTurn = def.perTurn;
    }
    if (def.hitsEncounter) card.hitsEncounter = true;
    if (def.stats) card.stats = { ...def.stats };
    if (def.ai) card.ai = def.ai;
    return card;
}

/** Plays a card's effects. Returns what happened, for the table to show. */
export function runCard(field, card, caster, target) {
    const ctx = { field, caster, target, card, result: { rolls: [] } };
    for (const effect of CARDS[card.name].effects) effect(ctx);
    return ctx.result;
}

/** Builds a deck from the cards' counts */
export function buildDeck(types) {
    const deck = [];
    for (const [name, def] of Object.entries(CARDS)) {
        if (!types.includes(def.type)) continue;
        for (let i = 0; i < (def.count || 0); i++) deck.push(makeCard(name));
    }
    return deck;
}
