/**
 * Plays lots of bot-only games and prints how they went. Handy for tuning
 * the bots (and the rules).
 *
 *   node test/balance.js [games]
 */
import HostServer from '../src/host/HostServer.js';
import { createLocalPair } from '../src/net/Endpoint.js';
import Bot from '../src/bots/Bot.js';

const GAMES = parseInt(process.argv[2] || '400', 10);

function playGame(numPlayers) {
    return new Promise((resolve, reject) => {
        const host = new HostServer({ necroPhaseDelay: 0 });
        const plays = [];
        let rounds = 0;
        // Record everything the host broadcasts
        const emit = host.emit.bind(host);
        host.emit = (key, data) => {
            if (key == 'spell played') plays.push({ caster: data.caster, card: data.cardname, target: data.target });
            if (key == 'turn start' && data == '##NECRO##') rounds++;
            if (key == 'game over') {
                host.destroy();
                resolve({ ...data, plays, rounds });
            }
            if (rounds > 300) {
                host.destroy();
                reject(new Error('Game did not finish'));
            }
            emit(key, data);
        };
        const names = ['Ann', 'Bob', 'Cat', 'Dan', 'Eve'].slice(0, numPlayers);
        const endpoints = names.map((name) => {
            const [serverSide, clientSide] = createLocalPair(false, true);
            host.addSocket(serverSide, name);
            new Bot(clientSide, { delay: 0 });
            return clientSide;
        });
        setTimeout(() => endpoints[0].emit('start'), 5);
    });
}

const stats = {};
for (const n of [4, 5]) {
    const s = stats[n] = { games: 0, necroWins: 0, rounds: 0, goodBolts: 0, goodBoltsOnNecro: 0, necroBolts: 0, necroBoltsOnGM: 0 };
    for (let i = 0; i < GAMES / 2; i++) {
        const { winners, roles, plays, rounds } = await playGame(n);
        const necro = Object.keys(roles).find((k) => roles[k] == 'Necromancer');
        s.games++;
        s.rounds += rounds;
        if (winners.length == 1 && winners[0] == necro) s.necroWins++;
        for (const p of plays) {
            if (p.card != 'Bolt') continue;
            if (p.caster == necro) {
                s.necroBolts++;
                if (roles[p.target] == 'Grandmaster') s.necroBoltsOnGM++;
            } else {
                s.goodBolts++;
                if (p.target == necro) s.goodBoltsOnNecro++;
            }
        }
    }
}

const pct = (a, b) => (b ? (100 * a / b).toFixed(0) + '%' : '-');
for (const [n, s] of Object.entries(stats)) {
    console.log(`${n} players, ${s.games} games:`);
    console.log(`  Necromancer wins:        ${pct(s.necroWins, s.games)}`);
    console.log(`  Average rounds:          ${(s.rounds / s.games).toFixed(1)}`);
    console.log(`  Good Bolts on the Necro: ${pct(s.goodBoltsOnNecro, s.goodBolts)} (random would be ${pct(1, n - 2)})`);
    console.log(`  Necro Bolts on the GM:   ${pct(s.necroBoltsOnGM, s.necroBolts)}`);
}
process.exit(0);
