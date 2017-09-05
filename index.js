'use strict';

const EventEmitter = require('events');

class PendingPromiseSet extends EventEmitter {
	constructor(useErrorEvents = false) {
		super();
		this._map = new Map();
	}

	get size() {
		return this._map.size;
	}

	clear() {
		this._map.clear();
		this.emit('clear');
	}

	delete(promise) {
		if (this._map.delete(promise)) {
			this.emit('delete', promise);
			return true;
		} else {
			return false;
		}
	}

	has(promise) {
		return this._map.has(promise);
	}

	add(promise) {
		if (promise === null || promise === undefined)
			return;
		if (!(promise instanceof Promise))
			throw new TypeError('promise must be a Promise.');

		if (!this._map.has(promise)) {
			let done = false;
			let wrapper = new Promise(resolve => {
				promise.then(v => {
					if (this._map.delete(promise))
						this.emit('resolve', v);
				}, v => {
					if (this._map.delete(promise))
						this.emit('reject', v);
				});
			});

			if (!done) {
				this._map.set(promise, wrapper);
			}
		}
		return promise;
	}

	join(...promises) {
		for(let promise of promises) {
			this.add(promise);
		}

		return this._map.size === 0
			? Promise.resolve()
			:  new Promise(resolve => {
				let listener = () => {
					if (this._map.size === 0) {
						this.removeListener('resolve', listener);
						this.removeListener('reject', listener);
						this.removeListener('deleted', listener);
						this.removeListener('clear', listener);
						resolve();
					}
				};

				this.addListener('resolve', listener);
				this.addListener('reject', listener);
				this.addListener('delete', listener);
				this.addListener('clear', listener);
			});
	}
}

module.exports = PendingPromiseSet;
