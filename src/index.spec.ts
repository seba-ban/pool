import "mocha";
import { expect } from "chai";
import { Pool, PoolElement, PoolElementTuple, PoolElementObject } from ".";

interface StatObject<T> {
  element: T;
  percentage: number;
  picks: number;
}
/**
 * Creates a stat object
 * @param picks
 */
const getStats = <T extends any>(picks: number, pool: Pool<T>) => {
  const stats: StatObject<T>[] = [];
  for (let i = 0; i < picks; i++) {
    const pick = pool.pick();

    let stat = stats.find((obj) => obj.element === pick);

    if (!stat) {
      stat = {
        element: pick,
        percentage: 0,
        picks: 0,
      };
      stats.push(stat);
    }

    stat.picks++;
    stat.percentage = (stat.picks / picks) * 100;
  }

  return stats;
};

const objArr: PoolElementObject<string>[] = [
  {
    amount: 100,
    element: "10",
  },
  {
    amount: 100,
    element: "10",
  },
  {
    amount: 100,
    element: "10",
  },
];

describe("Testing Pool class", () => {
  it("should pick undefined if nothing was passed to the constructor", () => {
    const pool = new Pool();
    for (let i = 0; i < 10; i++) expect(pool.pick()).to.equal(undefined);
  });

  // it("should return correct chances for picking each element", () => {
  //   const pool = new Pool(poolArr);
  //   const chances = pool.pool;

  //   for (const [str, amount] of poolArr) {
  //   }
  // });

  it("after 1000 picks, each element should be picked within ±5% compared to expected probability ", () => {
    const margin = 5;
    const tupleArr: PoolElementTuple<string>[] = [
      ["a", 50],
      ["b", 25],
      ["c", 10],
      ["d", 5],
      ["e", 5],
      ["f", 3],
      ["g", 2],
    ];
    const pool = new Pool(tupleArr);
    const stats = getStats(1000, pool);
    const chances = pool.pool;

    // check if the same amount of elements was picked and was available to be picked
    expect(stats.length).to.be.equal(chances.length);

    for (const { element, percentage } of stats) {
      const chanceForElement = chances.find((el) => el.element === element);

      if (!chanceForElement) throw new Error();
      // expect(chanceForElement).to.be.a("object");

      const from = chanceForElement.percentage - margin;
      const to = chanceForElement.percentage + margin;

      if (!(from <= percentage && percentage <= to)) throw new Error();
    }
  });
});
