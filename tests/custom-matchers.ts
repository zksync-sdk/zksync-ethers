import * as chai from 'chai';
import {types} from '../src';

const {expect} = chai;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Chai {
    interface Assertion {
      deepEqualExcluding(
        expected: Record<string, any>,
        excludeFields: string[]
      ): Assertion;
    }
  }
}

chai.Assertion.addMethod(
  'deepEqualExcluding',
  function (expected: Record<string, any>, excludeFields: string[]) {
    const obj1 = this._obj;

    for (const key in obj1) {
      if (!excludeFields.includes(key)) {
        chai.expect(obj1[key]).to.deep.equal(expected[key]);
      }
    }
  }
);

// Custom assertion function for BigNumber values with a percentage tolerance
export function expectBigNumberCloseTo(
  actual: bigint,
  expected: bigint,
  tolerancePercentage: number
) {
  const actualPercentageDiff = ((actual - expected) * 100n) / expected;
  const abs =
    actualPercentageDiff < 0n ? -actualPercentageDiff : actualPercentageDiff;
  expect(abs < tolerancePercentage).to.be.true;
}

export function expectFeeDataCloseToExpected(
  result: types.FullDepositFee,
  expected: types.FullDepositFee,
  tolerancePercentage: number
) {
  expectBigNumberCloseTo(
    result.baseCost.valueOf(),
    expected.baseCost.valueOf(),
    tolerancePercentage
  );
  expectBigNumberCloseTo(
    result.l1GasLimit.valueOf(),
    expected.l1GasLimit.valueOf(),
    tolerancePercentage
  );
  expectBigNumberCloseTo(
    result.l2GasLimit.valueOf(),
    expected.l2GasLimit.valueOf(),
    tolerancePercentage
  );
  expectBigNumberCloseTo(
    result.maxFeePerGas!.valueOf(),
    expected.maxFeePerGas!.valueOf(),
    tolerancePercentage
  );
  expectBigNumberCloseTo(
    result.maxPriorityFeePerGas!.valueOf(),
    expected.maxPriorityFeePerGas!.valueOf(),
    tolerancePercentage
  );
}
