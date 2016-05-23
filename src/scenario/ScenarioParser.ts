import {Token}            from '../lexer/Token';
import {TokenType}        from '../lexer/Token';
import {TokenBuffer}      from '../lexer/TokenBuffer';
import {Combinator}       from '../parser/Combinator';
import {CombinatorResult} from '../parser/CombinatorResult';
import {TerminalParser}   from '../parser/TerminalParser';
import {Sequence}         from '../parser/SequenceCombinator';
import {ZeroOrOne}        from '../parser/SequenceCombinator';
import {ZeroOrMore}       from '../parser/ListCombinator';
import {Parser}           from '../parser/Parser';

export class ScenarioParser extends Parser {
    constructor() {
        super();

        // console.log('terminal: ', this.terminal);
        // SEND EMAIL EMAIL_ID_IDENTIFIER (FROM SENDER_IDENTIFIER)+ TO TO_IDENTIFIER (AND TO_IDENTIFIERS)+
        this.nonTerminals['Send email'] = new Sequence(
            (matches, ruleDesc) => {
                ruleDesc['method'] = 'sendEmail';
                console.dir(ruleDesc);
            },
            new Sequence(
                (matches, ruleDesc) => { ruleDesc['emailID'] = matches[2][0]; },
                this.terminals[TokenType[TokenType.SEND]],
                this.terminals[TokenType[TokenType.EMAIL]],
                this.terminals[TokenType[TokenType.IDENTIFIER]]
            ),
            new ZeroOrOne(
                (matches, ruleDesc) => { ruleDesc['from'] = matches[1][0]; },
                this.terminals[TokenType[TokenType.FROM]],
                this.terminals[TokenType[TokenType.IDENTIFIER]]
            ),
            new Sequence(
                (matches, ruleDesc) => { ruleDesc['to'] = [ matches[1][0] ]; },
                this.terminals[TokenType[TokenType.TO]],
                this.terminals[TokenType[TokenType.IDENTIFIER]]
            ),
            new ZeroOrMore(
                (matches, ruleDesc) => {
                    if (matches) matches.forEach(match => (<string[]> ruleDesc['to']).push(match[0]) );
                },
                new ZeroOrOne(null, this.terminals[TokenType[TokenType.AND]]),
                this.terminals[TokenType[TokenType.IDENTIFIER]])
        );

    }
}
