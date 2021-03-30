Just some exercise, but could be written better, I'll revisit it one day... Basic idea is you have a container object where you can add an element with corresponding amount. Eg. you can add 10 strings "a", and 5 strings "b" - you'll have 15 elements in the pool, 10 pointing to "a", 5 - to "b". You can then pick a random element from the pool. Internally, all amounts are added to represent pool's `length` and each element has a corresponding range within 0-`length`. `pick` method just gets a random number from 0 to `length`, and finds the proper range (and thus element) using binary search.

---

<a name="Pool"></a>

## Pool
**Kind**: global class  

* [Pool](#Pool)
    * [new Pool(poolElements)](#new_Pool_new)
    * _instance_
        * [.length](#Pool+length)
        * [.pool](#Pool+pool)
        * [.elements](#Pool+elements)
        * [.get(index)](#Pool+get)
        * [.chanceFor(el)](#Pool+chanceFor)
        * [.pick()](#Pool+pick)
        * [.add(poolElement)](#Pool+add)
        * [.addMany(poolElements)](#Pool+addMany)
    * _static_
        * [.equal(elements)](#Pool.equal)
        * [.float(poolElements)](#Pool.float)

<a name="new_Pool_new"></a>

### new Pool(poolElements)
An iterable object. Efficiently stores given amount of elements


| Param |
| --- |
| poolElements | 

<a name="Pool+length"></a>

### pool.length
Number of elements in the pool

**Kind**: instance property of [<code>Pool</code>](#Pool)  
<a name="Pool+pool"></a>

### pool.pool
Returns an array of objects of signature { element, percentage }

**Kind**: instance property of [<code>Pool</code>](#Pool)  
<a name="Pool+elements"></a>

### pool.elements
Returns elements available to pick

**Kind**: instance property of [<code>Pool</code>](#Pool)  
<a name="Pool+get"></a>

### pool.get(index)
Get element at given index

**Kind**: instance method of [<code>Pool</code>](#Pool)  

| Param |
| --- |
| index | 

<a name="Pool+chanceFor"></a>

### pool.chanceFor(el)
Returns a percent of probability to pick given element

**Kind**: instance method of [<code>Pool</code>](#Pool)  

| Param |
| --- |
| el | 

<a name="Pool+pick"></a>

### pool.pick()
Pick a random element from the pool.

**Kind**: instance method of [<code>Pool</code>](#Pool)  
<a name="Pool+add"></a>

### pool.add(poolElement)
Add an element to the pool

**Kind**: instance method of [<code>Pool</code>](#Pool)  

| Param |
| --- |
| poolElement | 

<a name="Pool+addMany"></a>

### pool.addMany(poolElements)
Add many elements to the pool

**Kind**: instance method of [<code>Pool</code>](#Pool)  

| Param |
| --- |
| poolElements | 

<a name="Pool.equal"></a>

### Pool.equal(elements)
A helper function to create a pool from an array of elements
each element in the array will have the same chance to be picked

**Kind**: static method of [<code>Pool</code>](#Pool)  

| Param |
| --- |
| elements | 

<a name="Pool.float"></a>

### Pool.float(poolElements)
A helper function that allows passing non-integer amounts
only first four decimal places are taken into account

**Kind**: static method of [<code>Pool</code>](#Pool)  

| Param |
| --- |
| poolElements | 


---

Example:

```js
class User {
  constructor(public name: string) { }
}

const users = ['Monica', 'Rachel', "Phoebe", "Chandler", "Joey", "Ross"].map(name => new User(name))

const pool = new Pool<User>()
for (const user of users)
  pool.add([user, user.name.length])

console.log(pool.length)
// 34

console.log(pool.pool)
// [
//   { element: User { name: 'Monica' }, percentage: 17.647058823529413 },
//   { element: User { name: 'Rachel' }, percentage: 17.647058823529413 },
//   { element: User { name: 'Phoebe' }, percentage: 17.647058823529413 },
//   { element: User { name: 'Chandler' }, percentage: 23.52941176470588 },
//   { element: User { name: 'Joey' }, percentage: 11.76470588235294 },
//   { element: User { name: 'Ross' }, percentage: 11.76470588235294 }
// ]

console.log(pool.chanceFor(users[0]))
// 17.647058823529413

console.log(pool.pick())
// User { name: 'Monica' }
```