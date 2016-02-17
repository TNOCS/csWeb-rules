import Token = require('../../src/lexer/Token');
import tb    = require('../../src/lexer/TokenBuffer');
import cr    = require('../../src/parser/CombinatorResult');

describe('A CombinatorResult', function() {
    var tokenBuffer: tb.TokenBuffer;

    beforeEach(() => {
        tokenBuffer = new tb.TokenBuffer([
            new Token.Token(Token.TokenType.ACTIVATE, 1, 1, ['activate']),
            new Token.Token(Token.TokenType.LAYER, 1, 10, ['layer'])
        ]);
    });

    it('should return the correct match success.', () => {
        var combinatorResult = new cr.CombinatorResult(tokenBuffer, true);
        expect(combinatorResult.matchSuccess()).toBeTruthy();
        combinatorResult = new cr.CombinatorResult(tokenBuffer, false);
        expect(combinatorResult.matchSuccess()).toBeFalsy();
    });

    it('should return a token buffer', () => {
        var combinatorResult = new cr.CombinatorResult(tokenBuffer, true);
        expect(combinatorResult.getTokenBuffer()).toBe(tokenBuffer);
    });
});
