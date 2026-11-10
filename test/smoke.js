/**
 * Headless smoke test: runs full games between bots over the in-process
 * transport and checks that each one finishes with a sensible result.
 *
 *   npm test
 */
import HostServer from '../src/host/HostServer.js';
import { createLocalPair } from '../src/net/Endpoint.js';
import Bot from '../src/bots/Bot.js';

function playGame(numPlayers) {
    return new Promise((resolve, reject) => {
        const host = new HostServer({ necroPhaseDelay: 0 });
        const names = ['Ann', 'Bob', 'Cat', 'Dan', 'Eve'].slice(0, numPlayers);
        const endpoints = [];
        for (const name of names) {
            const [serverSide, clientSide] = createLocalPair(false, true);
            host.addSocket(serverSide, name);
            new Bot(clientSide, { delay: 0, maxPlays: 2 });
            endpoints.push(clientSide);
        }
        let turns = 0;
        endpoints[0].on('turn start', () => {
            if (++turns > 2000) {
                host.destroy();
                reject(new Error('Game did not finish within 2000 turns'));
            }
        });
        endpoints[0].on('game over', (result) => {
            host.destroy();
            resolve({ ...result, turns });
        });
        // A sixth player must be rejected once the lobby is full / started
        endpoints[0].on('accept connection', () => {
            setTimeout(() => endpoints[0].emit('start'), 10);
        });
    });
}

let failures = 0;
const tally = { Necromancer: 0, Good: 0 };
for (let i = 0; i < 20; i++) {
    const players = i % 2 ? 5 : 4;
    try {
        const { winners, roles, turns } = await playGame(players);
        const necro = Object.keys(roles).find((n) => roles[n] == 'Necromancer');
        const necroWon = winners.length == 1 && winners[0] == necro;
        if (!necroWon && winners.includes(necro)) throw new Error('Necromancer listed among good winners');
        tally[necroWon ? 'Necromancer' : 'Good']++;
        console.log(`game ${i + 1} (${players}p): ${necroWon ? 'Necromancer' : 'Good guys'} won after ${turns} turns`);
    } catch (e) {
        failures++;
        console.error(`game ${i + 1} FAILED:`, e);
    }
}

// Rejection checks
{
    const host = new HostServer();
    const got = [];
    for (const name of ['A', 'B', 'A', 'C', 'D', 'E', 'F']) {
        const [s, c] = createLocalPair(false, true);
        c.close = () => {};
        s.close = () => {};
        c.on('reject connection', (m) => got.push(`${name}: ${m}`));
        host.addSocket(s, name);
    }
    await new Promise((r) => setTimeout(r, 20));
    const expected = ['A: Username is already in use.', 'F: That room is full.'];
    if (JSON.stringify(got) != JSON.stringify(expected)) {
        failures++;
        console.error('Rejection test FAILED:', got);
    } else {
        console.log('rejection checks ok');
    }
}

console.log('\nResults:', tally);
if (failures) {
    console.error(`${failures} failure(s)`);
    process.exit(1);
}
console.log('All good.');
process.exit(0);
