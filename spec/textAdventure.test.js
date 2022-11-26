var index = require('../textAdventure.js');

describe('tests for textAdventure generator', function () {

    it('returns empty', function () {
        var result = index.adventureTextRequested('test')
        expect(result).toBe('');
    }),

    it('returns empty with @kevinhookebot', function () {
        var result = index.adventureTextRequested('@kevinhookebot test')
        expect(result).toBe('');
    }),

        it('returns north', function () {
        var result = index.adventureTextRequested('@kevinhookebot  go north')
        expect(result).toBe('north');
    }),

    it('returns south', function () {
        var result = index.adventureTextRequested('@kevinhookebot go south')
        expect(result).toBe('south');
    }),

    it('returns west', function () {
        var result = index.adventureTextRequested('@kevinhookebot go west')
        expect(result).toBe('west');
    }),

    it('returns east', function () {
        var result = index.adventureTextRequested('@kevinhookebot go east')
        expect(result).toBe('east');
    }),

    it('returns up', function () {
        var result = index.adventureTextRequested('@kevinhookebot go up')
        expect(result).toBe('up');
    }),

    it('returns down', function () {
        var result = index.adventureTextRequested('@kevinhookebot go down')
        expect(result).toBe('down');
    }),

    it('returns empty - no direction', function () {
        var result = index.adventureTextRequested('@kevinhookebot go ')
        expect(result).toBe('');
    }),

    it('returns empty - unrecognized', function () {
        var result = index.adventureTextRequested('@kevinhookebot abc def ')
        expect(result).toBe('');
    })
});