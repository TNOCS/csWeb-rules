import {Token}     from '../../src/lexer/Token';
import {TokenType} from '../../src/lexer/Token';
import {TokenBuffer} from '../../src/lexer/TokenBuffer';
import {CombinatorResult} from '../../src/parser/CombinatorResult';
import {TerminalParser} from '../../src/parser/TerminalParser';

describe('A TerminalParser', function() {
    var tokenBuffer: TokenBuffer,
        combinatorResult: CombinatorResult;

    beforeEach(() => {
        tokenBuffer = new TokenBuffer([
            new Token(TokenType.ACTIVATE, 1, 1, ['activate']),
            new Token(TokenType.LAYER, 1, 10, ['layer'])
        ]);
        combinatorResult = new CombinatorResult(tokenBuffer, true);
    });

    it('should immediately return when inbound did not match.', () => {
        var tp = new TerminalParser(TokenType.ACTIVATE);
        combinatorResult = new CombinatorResult(tokenBuffer, false);
        expect(tp.recognizer(combinatorResult)).toEqual(combinatorResult);
    });

    it('should return a false CombinatorResult when there is no match.', () => {
        var tp = new TerminalParser(TokenType.LAYER);
        expect(tp.recognizer(combinatorResult).matchSuccess()).toBeFalsy();
        tp = new TerminalParser(TokenType.ACTIVATE);
        expect(tp.recognizer(combinatorResult).matchSuccess()).toBeTruthy();
    });

    it('should return a a successfull CombinatorResult when there is a match.', () => {
        var tp = new TerminalParser(TokenType.ACTIVATE);
        // console.log('TokenBuffer1: ' + JSON.stringify(combinatorResult.getTokenBuffer(), null, 2));
        combinatorResult = tp.recognizer(combinatorResult);
        expect(combinatorResult.matchSuccess()).toBeTruthy();
        // console.log('TokenBuffer2: ' + JSON.stringify(combinatorResult.getTokenBuffer(), null, 2));
        tp = new TerminalParser(TokenType.LAYER);
        combinatorResult = tp.recognizer(combinatorResult);
        expect(combinatorResult.matchSuccess()).toBeTruthy();
    });
});
