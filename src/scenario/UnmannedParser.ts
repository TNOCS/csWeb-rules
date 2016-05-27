import {Token, TokenType}      from '../lexer/Token';
import {TokenBuffer}           from '../lexer/TokenBuffer';
import {Combinator}            from '../parser/Combinator';
import {RuleDescription}       from '../parser/CombinatorResult';
import {TerminalParser}        from '../parser/TerminalParser';
import {Sequence, ZeroOrOne}   from '../parser/SequenceCombinator';
import {ZeroOrMore, OneOrMore} from '../parser/ListCombinator';
import {Parser}                from '../parser/Parser';

export class UnmannedParser extends Parser {
    rules: RuleDescription[] = [];

    constructor() {
        super();

        // console.log('terminal: ', this.terminal);
        this.nonTerminals['Create rule'] = new Sequence(
            (matches, ruleDesc) => {
                ruleDesc.method = 'createRule';
                this.rules.push(ruleDesc);
                // console.dir(ruleDesc);
            },
            new Sequence(
                (matches, ruleDesc) => null,
                this.terminals[TokenType[TokenType.RULE]]
            ),
            new ZeroOrOne(
                (matches, ruleDesc) => { ruleDesc['ruleName'] = matches[0][0]; },
                this.terminals[TokenType[TokenType.STRING]]
            ),
            new ZeroOrOne(
                (matches, ruleDesc) => { ruleDesc['featureId'] = matches[2][0]; },
                this.terminals[TokenType[TokenType.FOR]],
                this.terminals[TokenType[TokenType.FEATURE]],
                this.terminals[TokenType[TokenType.IDENTIFIER]]
            )
        );

        this.nonTerminals['Add conditions'] = new Sequence(
            (matches, ruleDesc) => {
                ruleDesc.method = 'addCondition';
                ruleDesc.description = 'Add a condition to the currently active rule, either using CONDITION or AND, followed by property comparator value.';
                this.rules.push(ruleDesc);
                // console.dir(ruleDesc);
            },
            new ZeroOrOne(
                (matches, ruleDesc) => null,
                this.terminals[TokenType[TokenType.CONDITION]]
            ),
            new ZeroOrOne(
                (matches, ruleDesc) => null,
                this.terminals[TokenType[TokenType.AND]]
            ),
            new Sequence(
                (matches, ruleDesc) => {
                    ruleDesc['conditions'] = {
                        'property': matches[0][0].toLowerCase()
                    };
                },
                this.terminals[TokenType[TokenType.IDENTIFIER]]),
            new ZeroOrOne(
                (matches, ruleDesc) => { ruleDesc['conditions']['comparator'] = 'LE'; },
                this.terminals[TokenType[TokenType.LE]]
            ),
            new ZeroOrOne(
                (matches, ruleDesc) => { ruleDesc['conditions']['comparator'] = 'LEQ'; },
                this.terminals[TokenType[TokenType.LEQ]]
            ),
            new ZeroOrOne(
                (matches, ruleDesc) => { ruleDesc['conditions']['comparator'] = 'EQUALS'; },
                this.terminals[TokenType[TokenType.EQUALS]]
            ),
            new ZeroOrOne(
                (matches, ruleDesc) => { ruleDesc['conditions']['comparator'] = 'GEQ'; },
                this.terminals[TokenType[TokenType.GEQ]]
            ),
            new ZeroOrOne(
                (matches, ruleDesc) => { ruleDesc['conditions']['comparator'] = 'GE'; },
                this.terminals[TokenType[TokenType.GE]]
            ),
            new ZeroOrOne(
                (matches, ruleDesc) => { ruleDesc['conditions']['value'] = +matches[0][0]; },
                this.terminals[TokenType[TokenType.NUMBER]]
            ),
            new ZeroOrOne(
                (matches, ruleDesc) => { ruleDesc['conditions']['value'] =  matches[0][0]; },
                this.terminals[TokenType[TokenType.STRING]]
            )
        );
    }
}
