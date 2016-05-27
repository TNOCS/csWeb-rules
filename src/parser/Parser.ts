import {Token}                      from '../lexer/Token';
import {TokenType, ScanRecognizers} from '../lexer/Token';
import {TokenBuffer}                from '../lexer/TokenBuffer';
import {Combinator}                 from './Combinator';
import {CombinatorResult}           from './CombinatorResult';
import {TerminalParser}             from './TerminalParser';
import {Sequence}                   from './SequenceCombinator';
import {ZeroOrOne}                  from './SequenceCombinator';
import {ZeroOrMore}                 from './ListCombinator';

export class Parser {
    terminals: { [key: string]: Combinator } = {};
    nonTerminals: { [key: string]: Combinator };
    recognizedNonTerminals: string[];

    constructor() {
        this.nonTerminals = {};
        this.recognizedNonTerminals = [];

        let scanners = ScanRecognizers.getInstance();
        scanners.forEach(sr => {
            var name = TokenType[sr.token];
            var tokenType: TokenType = TokenType[name];
            this.terminals[name] = new TerminalParser(tokenType);
        });
    }

    parse(inbound: TokenBuffer) {
        var combinatorResult: CombinatorResult = new CombinatorResult(inbound, true);
        while (combinatorResult.matchSuccess && combinatorResult.hasNextToken) {
            combinatorResult = this.matchNonTerminal(combinatorResult);
        }
    }

    private matchNonTerminal(inbound: CombinatorResult) {
        var latestResult = inbound;
        var tokensToProcess = inbound.remainingTokensInBuffer;

        var key;
        for (key in this.nonTerminals) {
            if (!this.nonTerminals.hasOwnProperty(key)) continue;
            var nonTerminal = this.nonTerminals[key];
            latestResult = nonTerminal.recognizer(inbound);
            if (!latestResult.matchSuccess) continue;
            this.recognizedNonTerminals.push(key);
            // TODO take action
        }
        // var madeProgress = latestResult.remainingTokensInBuffer < tokensToProcess;
        // if (!madeProgress) {
        //     console.error(`Error: Infinite loop detected in non-terminal '${key}' and inbound sequence ${JSON.stringify(inbound.ruleDesc)}, ${JSON.stringify(inbound, null, 2)} `
        //         + `\nA non-terminal (most likely, a ZeroOrOne combinator) creates a match, but does not consume any tokens.`)
        // }
        return new CombinatorResult(latestResult.getTokenBuffer(), latestResult.matchSuccess); // && madeProgress);
    }
}
