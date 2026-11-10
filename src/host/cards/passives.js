/**
 * Passives: always-on effects from a character, or from equipment while it's
 * in front of you. They're plain data (no functions) so they travel with the
 * card and the client can read them too.
 *
 * Stats stack across every source and are capped per stat, so two Robes
 * stack because Evasion stacks, and so would anything else that gives it.
 */

/** Blocks this much damage from every hit */
export const Armor = (amount) => ({ stat: 'armor', amount });
/** Dodge Bolts on a roll of (7 - evasion) or more */
export const Evasion = (amount) => ({ stat: 'evasion', amount });
/** Added to your damage rolls */
export const Power = (amount) => ({ stat: 'power', amount });
/** Extra (or with a negative number, less) maximum health */
export const MaxHealth = (amount) => ({ stat: 'maxHealth', amount });
/** Damage with this tag (like 'fire') does nothing to you */
export const Immune = (tag) => ({ immune: tag });
/** You can play this many of a limited card per turn */
export const PerTurn = (cardName, amount) => ({ perTurn: cardName, amount });
/** Draw this many cards at the start of your turn */
export const Draws = (amount) => ({ draws: amount });
/** The first `times` times you'd die, you're left at `hp` instead */
export const DeathWard = (times, hp) => ({ deathWard: { times, hp } });

/** Most a stat can add up to */
export const STAT_CAPS = { armor: 3, evasion: 3 };

/** Every passive a player has: their character's and their equipment's */
export function passivesOf(player) {
    return [
        ...(player?.character?.passives ?? []),
        ...(player?.items ?? []).flatMap((item) => item.passives ?? []),
    ];
}

/** A player's total for a stat, after the cap */
export function statOf(player, stat) {
    const total = passivesOf(player).filter((p) => p.stat == stat).reduce((sum, p) => sum + p.amount, 0);
    return stat in STAT_CAPS ? Math.min(STAT_CAPS[stat], total) : total;
}

export function isImmune(player, tags = {}) {
    return passivesOf(player).some((p) => p.immune && tags[p.immune]);
}

/** How many of a limited card a player can play per turn */
export function perTurnLimit(player, card) {
    const boost = passivesOf(player).filter((p) => p.perTurn == card.name).map((p) => p.amount);
    return boost.length ? Math.max(...boost) : (card.perTurn ?? 1);
}

/** How many cards a player draws at the start of their turn */
export function drawsPerTurn(player) {
    const draws = passivesOf(player).filter((p) => p.draws).map((p) => p.draws);
    return draws.length ? Math.max(...draws) : 1;
}

/** The player's death ward, if any: { times, hp } */
export function deathWardOf(player) {
    return passivesOf(player).find((p) => p.deathWard)?.deathWard ?? null;
}
