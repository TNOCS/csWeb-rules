import {Token}            from '../../src/lexer/Token';
import {TokenType}        from '../../src/lexer/Token';
import {TokenBuffer}      from '../../src/lexer/TokenBuffer';
import {Combinator}       from '../../src/parser/Combinator';
import {ListCombinator}   from '../../src/parser/ListCombinator';
import {CombinatorResult} from '../../src/parser/CombinatorResult';
import {Lexer}            from '../../src/lexer/Lexer';
import {Parser}           from '../../src/parser/Parser';

describe('The ListCombinator', function() {
    var lexer: Lexer,
        parser: Parser;

    beforeEach(() => {
        lexer = new Lexer();
        parser = new Parser();
    });

    xit ('should not recognize other tokens: b', () => {});

    xit ('should recognize a sequence of consequetive identical tokens: a*', () => {
        lexer.analyse('users.erik users.alice users.bob.');
        var result: string[][];
        parser.nonTerminals['List of Identifiers'] = new ListCombinator(
            (combinatorResults) => { result = combinatorResults; },
            parser.terminals[TokenType[TokenType.IDENTIFIER]]
        );
        parser.parse(new TokenBuffer(lexer.tokenList));
        expect(parser.recognizedNonTerminals.length).toBe(1);
        expect(parser.recognizedNonTerminals[0]).toBe('List of Identifiers');
    });

    xit ('should recognize a sequence of consequetive different tokens: (ab)*', () => {});
});
