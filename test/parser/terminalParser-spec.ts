import Token  = require('../../src/lexer/Token');
import tb     = require('../../src/lexer/TokenBuffer');
import cr     = require('../../src/parser/CombinatorResult');
import parser = require('../../src/parser/TerminalParser');

describe('A TerminalParser', function() {
    var tokenBuffer: tb.TokenBuffer,
        combinatorResult: cr.CombinatorResult;

    beforeEach(() => {
        tokenBuffer = new tb.TokenBuffer([
            new Token.Token(Token.TokenType.ACTIVATE, 1, 1, ['activate']),
            new Token.Token(Token.TokenType.LAYER, 1, 10, ['layer'])
        ]);
        combinatorResult = new cr.CombinatorResult(tokenBuffer, true);
    });

    it('should immediately return when inbound did not match.', () => {
        var tp = new parser.TerminalParser(Token.TokenType.ACTIVATE);
        combinatorResult = new cr.CombinatorResult(tokenBuffer, false);
        expect(tp.recognizer(combinatorResult)).toEqual(combinatorResult);
    });

    it('should return a false CombinatorResult when there is no match.', () => {
        var tp = new parser.TerminalParser(Token.TokenType.LAYER);
        expect(tp.recognizer(combinatorResult).matchSuccess()).toBeFalsy();
        tp = new parser.TerminalParser(Token.TokenType.ACTIVATE);
        expect(tp.recognizer(combinatorResult).matchSuccess()).toBeTruthy();
    });

    it('should return a a successfull CombinatorResult when there is a match.', () => {
        var tp = new parser.TerminalParser(Token.TokenType.ACTIVATE);
        // console.log('TokenBuffer1: ' + JSON.stringify(combinatorResult.getTokenBuffer(), null, 2));
        combinatorResult = tp.recognizer(combinatorResult);
        expect(combinatorResult.matchSuccess()).toBeTruthy();
        // console.log('TokenBuffer2: ' + JSON.stringify(combinatorResult.getTokenBuffer(), null, 2));
        tp = new parser.TerminalParser(Token.TokenType.LAYER);
        combinatorResult = tp.recognizer(combinatorResult);
        expect(combinatorResult.matchSuccess()).toBeTruthy();
    });
});
