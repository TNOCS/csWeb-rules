import {Token}          from '../lexer/Token';
import {TokenType}                  from '../lexer/Token';
import {TokenBuffer}                from '../lexer/TokenBuffer';
import {Combinator}                 from './Combinator';
import {CombinatorResult}           from './CombinatorResult';
import {TerminalParser}             from './TerminalParser';
import {SequenceCombinator}         from './SequenceCombinator';
import {OptionalSequenceCombinator} from './SequenceCombinator';

export class Parser {
    private nonTerminals: { [key: string]: Combinator };
    recognizedNonTerminals: string[];

    constructor() {
        var terminals: { [key: string]: Combinator } = {};
        this.nonTerminals = {};
        this.recognizedNonTerminals = [];

        for (var tt in TokenType) {
            if (parseInt(tt, 10) >= 0) {
                var name: string = TokenType[tt];
                var tokenType: TokenType = TokenType[name];
                terminals[name] = new TerminalParser(tokenType);
            }
        }
        // console.log('terminal: ', this.terminal);
        this.nonTerminals['Send email'] = new SequenceCombinator(
            terminals[TokenType[TokenType.SEND]],
            terminals[TokenType[TokenType.EMAIL]],
            terminals[TokenType[TokenType.IDENTIFIER]],
            terminals[TokenType[TokenType.FROM]],
            terminals[TokenType[TokenType.IDENTIFIER]],
            terminals[TokenType[TokenType.TO]],
            terminals[TokenType[TokenType.IDENTIFIER]]
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
                this.recognizedNonTerminals.push(key);
                return latestResult;
            }
        }
        return inbound;
    }
}
