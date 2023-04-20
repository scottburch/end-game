import {expect} from "chai";
import {bytesToHex, hexToBytes} from "./byteUtils.js";

describe('byte utils', () => {
    it('should convert a Uint8Array to a hex string', () => {
        expect(bytesToHex(new Uint8Array([1,2,254]))).to.equal('0102fe');
        expect(bytesToHex(new Uint8Array([0,0,254,1,2,0]))).to.equal('0000fe010200');
    });

    it('should convert hex to a Uint8Array', () => {
        expect(Array.from(hexToBytes('000102fe'))).to.deep.equal([0, 1, 2, 254]);
    });
});