import {Token}            from '../../src/lexer/Token';
import {TokenType}        from '../../src/lexer/Token';
import {TokenBuffer}      from '../../src/lexer/TokenBuffer';
import {Combinator}       from '../../src/parser/Combinator';
import {OneOrMore}        from '../../src/parser/ListCombinator';
import {OneOrMore}        from '../../src/parser/ListCombinator';
import {CombinatorResult} from '../../src/parser/CombinatorResult';
import {Lexer}            from '../../src/lexer/Lexer';
import {Parser}           from '../../src/parser/Parser';

describe('The ZeroOrMore', function() {
    var lexer: Lexer,
        parser: Parser;

    beforeEach(() => {
        lexer = new Lexer();
        parser = new Parser();
    });

    it ('of a should not match other tokens b', () => {
        lexer.analyse('users.erik, users.alice, AND users.bob.');
        var result: string[][];
        parser.nonTerminals['List of Identifiers'] = new ZeroOrMore(
            (matches, ruleDesc) => { result = matches; },
            parser.terminals[TokenType[TokenType.IDENTIFIER]]
        );
        parser.parse(new TokenBuffer(lexer.tokenList));
        expect(parser.recognizedNonTerminals.length).toBe(2);
        expect(result.length).toBe(2);
    });

    it ('should recognize a sequence of consequetive identical tokens: a*', () => {
        lexer.analyse('users.erik users.alice users.bob.');
        var result: string[][];
        parser.nonTerminals['List of Identifiers'] = new OneOrMore(
            (matches, ruleDesc) => { result = matches; },
            parser.terminals[TokenType[TokenType.IDENTIFIER]]
        );
        parser.parse(new TokenBuffer(lexer.tokenList));
        expect(parser.recognizedNonTerminals.length).toBe(1);
        expect(result.length).toBe(3);
        expect(parser.recognizedNonTerminals[0]).toBe('List of Identifiers');
    });

    it ('should recognize a sequence of consequetive different tokens: (ab)*', () => {
        lexer.analyse('users.erik AND users.alice AND users.bob.');
        var result: string[][];
        parser.nonTerminals['List of Identifiers'] = new ZeroOrMore(
            (matches, ruleDesc) => { result = matches; },
            parser.terminals[TokenType[TokenType.IDENTIFIER]],
            parser.terminals[TokenType[TokenType.AND]]
        );
        parser.parse(new TokenBuffer(lexer.tokenList));
        expect(parser.recognizedNonTerminals.length).toBe(1);
        expect(result.length).toBe(5);
        expect(parser.recognizedNonTerminals[0]).toBe('List of Identifiers');
    });

});
