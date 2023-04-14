import {expect} from 'chai'
import {splitTags} from "./tagUtils";
import {map, of, switchMap, tap} from "rxjs";
describe('tag utils', () => {
    it('should split out tags and text', (done) => {
        of(splitTags('some #tags and #text here')).pipe(
            tap(({parts, tags}) => {
                expect(parts).to.deep.equal([ 'some ', ' and ', ' here' ]);
                expect(tags).to.deep.equal([ '#tags', '#text' ]);
            }),
            map(() => splitTags('#one and #two then #three')),
            tap(({parts, tags}) => {
                expect(parts).to.deep.equal(['', ' and ', ' then ', '']);
                expect(tags).to.deep.equal(['#one', '#two', '#three']);
            }),
            map(() => splitTags('has no tags')),
            tap(({parts, tags}) => {
                expect(parts).to.deep.equal(['has no tags']);
                expect(tags).to.deep.equal([]);
            })
        ).subscribe(() => done())
    })
})