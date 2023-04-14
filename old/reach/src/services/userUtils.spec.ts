
import {expect} from "chai";
import {fixupMentions} from "./userUtils.js";

describe('user service', () => {
    describe('fixupMentions()', () => {
        it('should remove formatting of mentions', () => {
            expect(fixupMentions('aaa @[@me](me) bbb @[#mine](mine)')).to.equal('aaa @me bbb #mine');
        });
    });
});