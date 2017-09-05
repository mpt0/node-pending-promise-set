# pending-promise-set

[![Travis](https://img.shields.io/travis/mpt0/node-pending-promise-set.svg)]()
[![npm](https://img.shields.io/npm/v/pending-promise-set.svg)]()
[![npm](https://img.shields.io/npm/l/pending-promise-set.svg)]()

A self-managing collection of pending promises

<br/>



## Installation
```bash
npm install pending-promise-set
```

<br/>



## Usage
```js
const PendingPromiseSet = require('pending-promise-set');
```

<br/>



## Properties

### `get size`
Get the size of the set.
```js
console.log(set.size);
```
+ returns `Number` - The number of contained promises.

<br/>



## Events

### `resolve(promise)`
Called when a promise from the set has been resolved.

### `reject(promise)`
Called when a promise from the set has been rejected.

### `delete(promise)`
Called when a promise has been deleted from the set using `set.delete(..)`.

### `clear()`
Called when the set has been cleared using `set.clear(..)`.

<br/>



## Functions

### `new PendingPromiseSet()`
Create an empty pending promise set.
```js
let set = new PendingPromiseSet();
```

<br/>



### `set.add(promise)`
Add a promise to the set. When the promise is resolved or rejected it will be deleted from the set.
```js
let promise = set.add(new Promise(resolve => {
	setTimeout(resolve, 500);
}));
```
+ promise `Promise` | `<null>` | `<undefined>` - The promise to add. `null`, `undefined` or duplicate promises are ignored.
+ returns `Promise` - The `promise` that was passed to `.add(..)`

<br/>



### `set.join(...promises)`
Create a promise that resolves as soon as the set is empty. Because non-pending promises are removed automatically, you can use `.join(..)` to wait for all promises in the set.
```js
set.add(someAction());
set.add(someOtherAction());
await set.join();
```
+ promises `Promise...` - Optional promises to `add` before.
+ returns `Promise`

<br/>



### `set.has(promise)`
Check if the set has the specified promise.
```js
let hasPromise = set.has(myPromise);
```
+ promise `<any>` - The promise to test for.
+ returns `boolean`

<br/>



### `set.delete(promise)`
Delete a promise from the set.
```js
let promise = set.add(someAction());
await someOtherAction();
set.delete(promise);
```
+ promise `<any>` - The promise to delete.
+ returns `boolean` - True, if the promise has been removed, otherwise false.

<br/>



### `set.clear()`
Delete all promises from the set.
```js
set.clear();
```
