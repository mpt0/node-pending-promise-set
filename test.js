'use strict';

const assert = require('assert');
const PendingPromiseSet = require('.');

const wait = ms => new Promise(r => setTimeout(r, ms));
const waitAndReject = ms => new Promise((_, r) => setTimeout(() => r('rejected.'), ms));



let done = false;

async function test() {
	let resolvedOnes = new Set();
	let rejectedOnes = new Set();
	let set = new PendingPromiseSet();
	set.on('resolve', promise => resolvedOnes.add(promise));
	set.on('reject', promise => rejectedOnes.add(promise));

	let p1 = set.add(wait(100));
	let p2 = set.add(wait(200));
	assert(set.has(p1));
	assert(set.has(p2));
	assert.strictEqual(set.size, 2);
	set.delete(p1);
	assert(!set.has(p1));
	assert(set.has(p2));
	assert.strictEqual(set.size, 1);

	let joined = false;
	set.join().then(() => joined = true);

	assert.strictEqual(resolvedOnes.size, 0);
	assert.strictEqual(rejectedOnes.size, 0);

	await wait(150);
	assert.strictEqual(set.size, 1);
	assert(set.has(p2));
	assert(!joined);

	assert.strictEqual(resolvedOnes.size, 0);
	assert.strictEqual(rejectedOnes.size, 0);

	await wait(100);
	assert.strictEqual(set.size, 0);
	assert(!set.has(p2));
	assert(joined);

	assert.strictEqual(resolvedOnes.size, 1);
	assert.strictEqual(rejectedOnes.size, 0);

	set.add(waitAndReject(0));
	await wait(50);
	assert.strictEqual(resolvedOnes.size, 1);
	assert.strictEqual(rejectedOnes.size, 1);

	done = true;
}

test().catch(err => {
	console.error(err);
	process.exit(1);
});

wait(350).then(() => {
	if (!done) {
		console.error('Something got lost in space...');
		process.exit(1);
	}
});
