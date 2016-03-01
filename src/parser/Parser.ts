import {Token}                      from '../lexer/Token';
import {TokenType}                  from '../lexer/Token';
import {TokenBuffer}                from '../lexer/TokenBuffer';
import {Combinator}                 from './Combinator';
import {CombinatorResult}           from './CombinatorResult';
import {TerminalParser}             from './TerminalParser';
import {SequenceCombinator}         from './SequenceCombinator';
import {OptionalSequenceCombinator} from './SequenceCombinator';
import {ZeroOrMore}                 from './ListCombinator';

export class Parser {
    terminals: { [key: string]: Combinator } = {};
    nonTerminals: { [key: string]: Combinator };
    recognizedNonTerminals: string[];

    constructor() {
        this.nonTerminals = {};
        this.recognizedNonTerminals = [];

        for (var tt in TokenType) {
            if (parseInt(tt, 10) >= 0) {
                var name: string = TokenType[tt];
                var tokenType: TokenType = TokenType[name];
                this.terminals[name] = new TerminalParser(tokenType);
            }
        }
        // console.log('terminal: ', this.terminal);
        this.nonTerminals['Send email'] = new SequenceCombinator(
            (matches, ruleDesc) => {
                console.dir(ruleDesc);
            },
            new SequenceCombinator(
                (matches, ruleDesc) => { ruleDesc['emailID'] = matches[2][0]; },
                this.terminals[TokenType[TokenType.SEND]],
                this.terminals[TokenType[TokenType.EMAIL]],
                this.terminals[TokenType[TokenType.IDENTIFIER]]
            ),
            new OptionalSequenceCombinator(
                (matches, ruleDesc) => { ruleDesc['from'] = matches[1][0]; },
                this.terminals[TokenType[TokenType.FROM]],
                this.terminals[TokenType[TokenType.IDENTIFIER]]
            ),
            new SequenceCombinator(
                (matches, ruleDesc) => { ruleDesc['to'] = [ matches[1][0] ]; },
                this.terminals[TokenType[TokenType.TO]],
                this.terminals[TokenType[TokenType.IDENTIFIER]]
            ),
            new ZeroOrMore(
                (matches, ruleDesc) => {
                    if (matches) matches.forEach(match => (<string[]> ruleDesc['to']).push(match[0]) );
                },
                this.terminals[TokenType[TokenType.IDENTIFIER]])
        );
    }

    parse(inbound: TokenBuffer) {
        var combinatorResult: CombinatorResult = new CombinatorResult(inbound, true);
        while (combinatorResult.matchSuccess() && combinatorResult.hasNextToken()) {
            combinatorResult = this.matchNonTerminal(combinatorResult);
        }
    }

    private matchNonTerminal(inbound: CombinatorResult) {
        var latestResult = inbound;

        for (var key in this.nonTerminals) {
            if (!this.nonTerminals.hasOwnProperty(key)) continue;
            var nonTerminal = this.nonTerminals[key];
            latestResult = nonTerminal.recognizer(inbound);
            if (latestResult.matchSuccess()) {
                break;
            }
        }
        if (latestResult.matchSuccess()) {
           this.recognizedNonTerminals.push(key);
            // TODO take action
        }
        return new CombinatorResult(inbound.getTokenBuffer(), latestResult.matchSuccess());
    }
}
