import * as chai from "chai";

declare global {
    namespace Chai {
        interface Assertion {
            deepEqualExcluding(expected: Record<string, any>, excludeFields: string[]): Assertion;
        }
    }
}

chai.Assertion.addMethod(
    "deepEqualExcluding",
    function (expected: Record<string, any>, excludeFields: string[]) {
        const obj1 = this._obj;

        for (const key in obj1) {
            if (!excludeFields.includes(key)) {
                chai.expect(obj1[key]).to.deep.equal(expected[key]);
            }
        }
    },
);
