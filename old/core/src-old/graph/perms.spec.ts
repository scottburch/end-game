import {isNotWorldWritable, isWorldWritable} from "./perms";
import {expect} from 'chai';

describe('permission functions', () => {
    it('should check permissions', () => {
        expect(isWorldWritable(0o002)).to.be.true;
        expect(isWorldWritable(0o775)).to.be.false;

        expect(isNotWorldWritable(0o775)).to.be.true;
        expect(isNotWorldWritable(0o002)).to.be.false;
    });
});