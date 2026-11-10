/**
 * Things the bots say. {c} is whoever did it, {t} is who it happened to,
 * {gm} is the Grandmaster. One line gets picked at random.
 */
export const LINES = {
    /** A good bot saw someone Bolt the Grandmaster */
    boltedGM: [
        "{c} just Bolted {gm}. I think we found our Necromancer.",
        "Uh, {c}? Why are you hitting {gm}?",
        "{c} is sus. Just saying.",
        "Everyone saw that, right? {c}?",
    ],
    /** Someone Bolted me and I know I'm innocent */
    boltedMe: [
        "Ow. {c}, I'm on your side!",
        "{c}, really? I'm a Sorcerer!",
        "Wow, {c}. Noted.",
        "Hey! {c}!",
    ],
    /** I'm the one people suspect */
    defend: [
        "It's not me, I swear.",
        "I'm innocent! Look at who's been hitting {gm}.",
        "Why is everyone looking at me",
        "Wrong wizard, folks.",
    ],
    /** The Necromancer pointing at whoever already looks guilty */
    frame: [
        "Has anyone else noticed {t} keeps acting weird?",
        "My money's on {t}.",
        "I don't trust {t}.",
        "{t} is the Necromancer. Calling it now.",
    ],
    /** I got Witch Brewed */
    brewed: [
        "Somebody brewed me. Rude.",
        "There goes all my mana...",
        "Who has a cauldron?? Show yourself",
    ],
    /** A monster showed up */
    horror: [
        "WHAT is that.",
        "Nope. Nope nope nope.",
        "Who summoned the squid?!",
        "Okay, kill it first, accuse people second.",
    ],
    healedMe: [
        "Thanks, {c}!",
        "{c} is a real one.",
    ],
    frozeMe: [
        "{c} froze me. Suspicious if you ask me.",
        "Cold, {c}. Literally.",
    ],
    died: [
        "RIP {t}.",
        "{t}, you'll be missed. Probably.",
        "F",
    ],
    risen: [
        "{t} is BACK? And working for the Necromancer now??",
        "Oh no. {t} is a Thrall now.",
    ],
    iRose: [
        "I'm back! ...and I feel weird.",
        "The Necromancer sends their regards.",
    ],
    /** Someone said our name in chat */
    mentioned: [
        "{c}, it's not me!",
        "Me? Look at yourself, {c}.",
        "I'm literally just a Sorcerer, {c}.",
    ],
    won: ["gg!", "gg, that was close", "ggs everyone"],
    lost: ["gg", "gg. Next time.", "I knew it was them..."],
};

export function pick(key, vars = {}) {
    const options = LINES[key];
    const line = options[Math.floor(Math.random() * options.length)];
    return line.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m);
}
