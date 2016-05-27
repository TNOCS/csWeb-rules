import {Lexer}                 from '../../src/lexer/Lexer';
import {Token, TokenType}      from '../../src/lexer/Token';
import {TokenBuffer}           from '../../src/lexer/TokenBuffer';
import {Combinator}            from '../../src/parser/Combinator';
import {CombinatorResult}      from '../../src/parser/CombinatorResult';
import {TerminalParser}        from '../../src/parser/TerminalParser';
import {Sequence, ZeroOrOne}   from '../../src/parser/SequenceCombinator';
import {ZeroOrMore, OneOrMore} from '../../src/parser/ListCombinator';
import {UnmannedParser}        from '../../src/scenario/UnmannedParser';

describe('An Unmanned Scenario Parser', function() {
    var tokenBuffer: TokenBuffer,
        lexer: Lexer,
        parser: UnmannedParser;

    beforeEach(() => {
        lexer = new Lexer();
        parser = new UnmannedParser();
    });

    it('should create new unnamed rules for features.', () => {
        lexer.analyse('RULE FOR FEATURE FEATURE_ID');
        parser.parse(new TokenBuffer(lexer.tokenList));
        let rule = parser.rules[0];
        expect(rule.method).toBe('createRule');
        expect(rule['featureId']).toBe('FEATURE_ID');
    });

    it('should create new named rules for features.', () => {
        lexer.analyse('RULE "My rule name" FOR FEATURE FEATURE_ID');
        parser.parse(new TokenBuffer(lexer.tokenList));
        let rule = parser.rules[0];
        expect(rule.method).toBe('createRule');
        expect(rule['featureId']).toBe('FEATURE_ID');
        expect(rule['ruleName']).toBe('My rule name');
    });

    it('should add conditions.', () => {
        lexer.analyse('CONDITION SPEED > 80');
        parser.parse(new TokenBuffer(lexer.tokenList));
        let rule = parser.rules[0];
        // console.log(JSON.stringify(rule, null, 2));
        expect(rule.method).toBe('addCondition');
        expect(rule['conditions']['property']).toBe('speed');
        expect(rule['conditions']['comparator']).toBe('GE');
        expect(rule['conditions']['value']).toBe(80);
    });

    it('should add conditions using AND.', () => {
        lexer.analyse('AND SPEED > 80');
        parser.parse(new TokenBuffer(lexer.tokenList));
        let rule = parser.rules[0];
        // console.log(JSON.stringify(rule, null, 2));
        expect(rule.method).toBe('addCondition');
        expect(rule['conditions']['property']).toBe('speed');
        expect(rule['conditions']['comparator']).toBe('GE');
        expect(rule['conditions']['value']).toBe(80);
    });

});
