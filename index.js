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
						this.emit('resolve', v, promise);
				}, v => {
					if (this._map.delete(promise))
						this.emit('reject', v, promise);
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

	handle(getResults = true) {
		return new Promise((resolve, reject) => {
			let results = [];
			let errors = [];

			let onResolve;
			if (getResults) {
				onResolve = value => results.push(value);
				this.addListener('resolve', onResolve);
			}
			let onReject = value => errors.push(value);
			this.addListener('reject', onReject);

			this.join().then(() => {
				if (getResults) {
					this.removeListener('resolve', onResolve);
				}
				this.removeListener('reject', onReject);
				if (errors.length > 0) {
					reject(errors);
				} else {
					resolve(results);
				}
			});
		});
	}



	captureErrors() {
		let errors = new Set();
		let listener = err => {
			errors.add(err);
		};
		this.addListener('reject', listener);
		return (throwErrors = PendingPromiseSet.throwErrors) => {
			this.removeListener('reject', listener);
			if (errors.size > 0) {
				throwErrors(errors);
			}
		};
	}

	static throwErrors(set) {
		if (errors.size > 0) {
			let err = new Error('One or more errors occured.');
			err.errors = Array.from(set);
			throw err;
		}
	}
}

module.exports = PendingPromiseSet;
