import {TokenType}        from '../../src/lexer/Token';
import {Token}            from '../../src/lexer/Token';
import {TokenBuffer}      from '../../src/lexer/TokenBuffer';
import {CombinatorResult} from '../../src/parser/CombinatorResult';

describe('A CombinatorResult', function() {
    var tokenBuffer: TokenBuffer;

    beforeEach(() => {
        tokenBuffer = new TokenBuffer([
            new Token(TokenType.ACTIVATE, 1, 1, ['activate']),
            new Token(TokenType.LAYER, 1, 10, ['layer'])
        ]);
    });

    it('should return the correct match success.', () => {
        var combinatorResult = new CombinatorResult(tokenBuffer, true);
        expect(combinatorResult.matchSuccess()).toBeTruthy();
        combinatorResult = new CombinatorResult(tokenBuffer, false);
        expect(combinatorResult.matchSuccess()).toBeFalsy();
    });

    it('should return a token buffer', () => {
        var combinatorResult = new CombinatorResult(tokenBuffer, true);
        expect(combinatorResult.getTokenBuffer()).toBe(tokenBuffer);
    });
});
