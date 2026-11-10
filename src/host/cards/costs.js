/**
 * What a card actually costs a given player. Cards print their normal price,
 * but the Necromancer's Bolts are free. Mana banks are secret, so nobody else
 * can tell: everyone assumes the Necromancer paid like the rest of us.
 */
export function costFor(card, roleName) {
    if (card.name == 'Bolt' && roleName == 'Necromancer') return 0;
    return card.cost ?? 0;
}
