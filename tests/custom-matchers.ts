import * as chai from 'chai';
import {BigNumber} from 'ethers';
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
  actual: BigNumber,
  expected: BigNumber,
  tolerancePercentage: number
) {
  const actualPercentageDiff = actual
    .sub(expected)
    .mul(100)
    .div(expected)
    .abs();
  expect(actualPercentageDiff.lte(tolerancePercentage)).to.be.true;
}

export function expectFeeDataCloseToExpected(
  result: types.FullDepositFee,
  expected: types.FullDepositFee,
  tolerancePercentage: number
) {
  expectBigNumberCloseTo(
    result.baseCost,
    expected.baseCost,
    tolerancePercentage
  );
  expectBigNumberCloseTo(
    result.l1GasLimit,
    expected.l1GasLimit,
    tolerancePercentage
  );
  expectBigNumberCloseTo(
    result.l2GasLimit,
    expected.l2GasLimit,
    tolerancePercentage
  );
  expectBigNumberCloseTo(
    result.maxFeePerGas!,
    expected.maxFeePerGas!,
    tolerancePercentage
  );
  expectBigNumberCloseTo(
    result.maxPriorityFeePerGas!,
    expected.maxPriorityFeePerGas!,
    tolerancePercentage
  );
}
