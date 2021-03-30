const LENGTH = Symbol();
const FIND_RANGE_INDEX = Symbol();
const POOL_ELEMENTS = Symbol();
const POOL_RANGES = Symbol();
const RANDOM_INDEX = Symbol();
const GET_AT_INDEX = Symbol();
const ADD_TO_POOL = Symbol();
const PROCESS_POOLELEMENT = Symbol();
const CHECK_POOLELEMENTTUPLE = Symbol();
const CHECK_POOLELEMENTOBJECT = Symbol();

const poolElementObjectKeys = ["amount", "element"];

/** An object accepted by the Pool class. */
export interface PoolElementObject<T extends any> {
  /** Amount of elements to be added to the pool. It should be an integer. */
  amount: number;
  /** Element to be added to the pool. */
  element: T;
}

/**
 * [
 * Element to be added to the pool,
 * Amount of elements to be added to the pool. It should be an integer
 * ]
 * */
export type PoolElementTuple<T extends any> = [T, number];

export type PoolElement<T extends any> =
  | PoolElementObject<T>
  | PoolElementTuple<T>;

/**
 * @private 
 * Errors to check for 
 * */
const ERRORS = {
  /** object is not PoolElement */
  NOT_ARRAY_NOR_OBJECT: () => new TypeError("Only arrays and objects allowed."),
  /** PoolElementTuple length is not 2 */
  TUPLE_LENGTH: () => new TypeError("PoolElementTuple should have length 2."),
  /** amount passed to the PoolElementTuple is not an integer */
  NOT_INT_IN_TUPLE: () =>
    new TypeError("Second element of PoolElementTuple should be an integer."),
  /** amount passed to the PoolElementObject is not an integer */
  NOT_INT_IN_OBJECT: () =>
    new TypeError(
      "`chance` property on PoolElementObject should be an integer."
    ),
  /** PoolElementObject is missing a key */
  KEY_MISSING: (key: string) =>
    new TypeError(`PoolElementObject missing key: ${key}.`),
  /** invalid index requested */
  RANGE_INDEX: (length: number) =>
    new RangeError(`Argument should be between 0 and ${length}.`),
};

export class Pool<T extends any> {
  private [LENGTH] = 0;
  private [POOL_ELEMENTS]: T[] = [];
  private [POOL_RANGES]: number[] = [];

  /**
   * An iterable object. Efficiently stores given amount of elements
   * @param poolElements
   */
  constructor(poolElements: PoolElement<T>[] = []) {
    for (const el of poolElements) this[PROCESS_POOLELEMENT](el);
  }

  /**
   * A helper function to create a pool from an array of elements
   * each element in the array will have the same chance to be picked
   * @param elements
   */
  static equal<T extends any>(elements: T[]) {
    return new Pool(elements.map((el) => [el, 1]));
  }

  /**
   * A helper function that allows passing non-integer amounts
   * only first four decimal places are taken into account
   * @param poolElements
   */
  static float<T extends any>(poolElements: PoolElement<T>[]) {
    const decimalPlacesAllowed = 4;

    const elems: PoolElementTuple<T>[] = [];

    const floatToInt = (num: number) =>
      Math.trunc(num * 10 ** decimalPlacesAllowed);

    for (const poolElement of poolElements)
      if (Array.isArray(poolElement)) {
        Pool.prototype[CHECK_POOLELEMENTTUPLE](poolElement, false);
        elems.push([poolElement[0], floatToInt(poolElement[1])]);
      } else if (typeof poolElement === "object") {
        Pool.prototype[CHECK_POOLELEMENTOBJECT](poolElement, false);
        elems.push([poolElement.element, floatToInt(poolElement.amount)]);
      } else {
        throw ERRORS.NOT_ARRAY_NOR_OBJECT();
      }

    return new Pool(elems);
  }

  //**************************************************************
  //********************** PUBLIC INTERFACE **********************
  //**************************************************************

  /**
   * Number of elements in the pool
   */
  get length() {
    return this[LENGTH];
  }

  /**
   * Returns an array of objects of signature { element, percentage }
   */
  get pool() {
    return this[POOL_ELEMENTS].map((element) => {
      return {
        element,
        percentage: this.chanceFor(element),
      };
    });
  }

  /**
   * Returns elements available to pick
   */
  get elements() {
    return this[POOL_ELEMENTS].slice();
  }

  /**
   * Get element at given index
   * @param index
   */
  public get(index: number) {
    return this[GET_AT_INDEX](index);
  }

  /**
   * Returns a percent of probability to pick given element
   * @param el
   */
  public chanceFor(el: T) {
    const index = this[POOL_ELEMENTS].indexOf(el);

    if (index === -1) return 0;

    const amount =
      index > 0
        ? this[POOL_RANGES][index] - this[POOL_RANGES][index - 1]
        : this[POOL_RANGES][index] + 1;

    return (amount / this[LENGTH]) * 100;
  }

  /**
   * Pick a random element from the pool.
   */
  public pick() {
    return this[GET_AT_INDEX](this[RANDOM_INDEX]()) as T;
  }

  /**
   * Add an element to the pool
   * @param poolElement
   */
  public add(poolElement: PoolElement<T>) {
    this[PROCESS_POOLELEMENT](poolElement);
  }

  /**
   * Add many elements to the pool
   * @param poolElements
   */
  public addMany(poolElements: PoolElement<T>[]) {
    for (const el of poolElements) this[PROCESS_POOLELEMENT](el);
  }

  //***********************************************************
  //************************* PRIVATE *************************
  //***********************************************************

  /**
   * @private 
   * checks and adds an element to the pool
   * @param poolElement
   */
  private [PROCESS_POOLELEMENT](poolElement: PoolElement<T>) {
    if (Array.isArray(poolElement)) {
      this[CHECK_POOLELEMENTTUPLE](poolElement);
      this[ADD_TO_POOL](...poolElement);
      // process PoolElementObject
    } else if (typeof poolElement === "object") {
      this[CHECK_POOLELEMENTOBJECT](poolElement);
      this[ADD_TO_POOL](poolElement.element, poolElement.amount);
    } else {
      throw ERRORS.NOT_ARRAY_NOR_OBJECT();
    }
  }

  /**
   * @private 
   * Helper function checking if object is a PoolElementObject
   * @param obj
   */
  private [CHECK_POOLELEMENTOBJECT](
    obj: PoolElementObject<T>,
    mustBeInt = true
  ) {
    for (const key of poolElementObjectKeys)
      if (!(key in obj)) throw ERRORS.KEY_MISSING(key);
    if (mustBeInt && !Number.isInteger(obj.amount))
      throw ERRORS.NOT_INT_IN_OBJECT();
  }

  /**
   * @private 
   * Helper function checking if array is a PoolElementTuple
   * @param arr
   */
  private [CHECK_POOLELEMENTTUPLE](arr: PoolElementTuple<T>, mustBeInt = true) {
    if (arr.length !== 2) throw ERRORS.TUPLE_LENGTH();
    if (mustBeInt && !Number.isInteger(arr[1])) throw ERRORS.NOT_INT_IN_TUPLE();
  }

  /**
   * @private 
   * Adds an element to the pool
   * @param element
   * @param chance
   */
  private [ADD_TO_POOL](element: T, chance: number) {
    this[LENGTH] += chance;
    this[POOL_ELEMENTS].push(element);
    this[POOL_RANGES].push(this[LENGTH] - 1);
  }

  /**
   * Not really needed...
   */
  *[Symbol.iterator]() {
    for (let i = 0; i < this[LENGTH]; i++) yield this[GET_AT_INDEX](i);
  }

  /**
   * @private 
   * Finds corresponding index of element in [POOL_ELEMENTS] array
   * based on in which range the toFind parameter is in
   * binary search used to speed up the lookup
   * @param toFind number
   */
  private [FIND_RANGE_INDEX](toFind: number) {
    if (toFind < 0 || toFind >= this[LENGTH])
      throw ERRORS.RANGE_INDEX(this[LENGTH]);

    let start = 0;
    let end = this[POOL_RANGES].length;
    let index = -1;

    do {
      if (end < start) break;

      if (end === start) {
        index = end;
        break;
      }

      const middle = Math.floor((end - start) / 2) + start;

      const from = middle > 0 ? this[POOL_RANGES][middle - 1] + 1 : 0;
      const to = this[POOL_RANGES][middle];

      if (from <= toFind && toFind <= to) {
        index = middle;
        break;
      }

      if (from > toFind) {
        end = middle;
      }

      if (to < toFind) {
        start = middle + 1;
      }
    } while (true);

    return index;
  }

  /**
   * @private 
   * Get a random index from 0 to the length of the pool (not inclusive)
   */
  private [RANDOM_INDEX]() {
    const min = 0;
    const max = this[LENGTH];
    return Math.floor(Math.random() * (max - min)) + min;
  }

  /**
   * @private 
   * find element at
   * @param index
   */
  private [GET_AT_INDEX](index: number) {
    if (index >= this[LENGTH] || index < 0) return undefined;

    return this[POOL_ELEMENTS][this[FIND_RANGE_INDEX](index)];
  }
}