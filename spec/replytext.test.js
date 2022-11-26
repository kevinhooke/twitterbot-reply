var index = require('../index.js');

describe('tests for reply text generator', function(){

    it('produces value in range to 5', function(){
        var next = index.nextIntInRange(5);
        expect(next).toBeGreaterThan(-1);
        expect(next).toBeLessThan(5);
    });

    it('returns text value', function(){
        var text = index.getTextReply();
        expect(text).not.toBe(undefined);
    });

});