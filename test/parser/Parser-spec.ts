import {Token}            from '../../src/lexer/Token';
import {TokenType}        from '../../src/lexer/Token';
import {TokenBuffer}      from '../../src/lexer/TokenBuffer';
import {Lexer}            from '../../src/lexer/Lexer';
import {CombinatorResult} from '../../src/parser/CombinatorResult';
import {TerminalParser}   from '../../src/parser/TerminalParser';
import {Parser}           from '../../src/parser/Parser';

describe('The parser', function() {
    var emailTokenBuffer: TokenBuffer,
        emailCombinatorResult: CombinatorResult,
        lexer: Lexer;

    beforeEach(() => {
        emailTokenBuffer = new TokenBuffer([
            new Token(TokenType.SEND, 1, 1, ['send']),
            new Token(TokenType.EMAIL, 1, 10, ['email']),
            new Token(TokenType.IDENTIFIER, 1, 10, ['emails.weather9am']),
            new Token(TokenType.FROM, 1, 10, ['from']),
            new Token(TokenType.IDENTIFIER, 1, 10, ['erik']),
            new Token(TokenType.TO, 1, 10, ['to']),
            new Token(TokenType.IDENTIFIER, 1, 10, ['bert']),
        ]);
        emailCombinatorResult = new CombinatorResult(emailTokenBuffer, true);
        lexer = new Lexer();
    });

    it('should parse an email token buffer.', () => {
        var parser = new Parser();
        parser.parse(emailTokenBuffer);
        expect(parser.recognizedNonTerminals.length).toBe(1);
        expect(parser.recognizedNonTerminals[0]).toBe('Send email');
    });

    it('should parse textual emails.', () => {
        lexer.analyse('Send email emails.weather from users.erik to users.bert.');
        var parser = new Parser();
        parser.parse(new TokenBuffer(lexer.tokenList));
        expect(parser.recognizedNonTerminals.length).toBe(1);
        expect(parser.recognizedNonTerminals[0]).toBe('Send email');
    });
});
