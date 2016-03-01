import {TokenType}         from '../lexer/Token';
import {CombinatorResult}  from './CombinatorResult';
import {Combinator}        from './Combinator';
import {ICombinatorAction} from './Combinator';
import {TokenBuffer}       from '../lexer/TokenBuffer';

export class TerminalParser extends Combinator {
    private tokenMatch: TokenType;

    /**
     * Match a TokenType, optionally adding an action to perform when a match occurs.
     * @param  {TokenType} match
     * @param  {(combinatorResults:string[])=>void} privateaction?
     */
    constructor(match: TokenType, action?: ICombinatorAction) {
        super();
        if (action) this.action = action;
        this.tokenMatch = match;
    }

    /**
     * Recognizer: recognize token sequence.
     * @param  {CombinatorResult} inbound
     */
    recognizer(inbound: CombinatorResult) {
        if (!inbound.matchSuccess()) return inbound;
        if (!inbound.hasNextToken()) return new CombinatorResult(inbound.getTokenBuffer(), false, inbound.ruleDesc);
        var latestResult: CombinatorResult,
            tokens = inbound.getTokenBuffer(),
            token = tokens.nextToken();
        if (token.isTokenType(this.tokenMatch)) {
            var outTokens = new TokenBuffer(tokens.makePoppedTokenList());
            latestResult = new CombinatorResult(outTokens, true, inbound.ruleDesc, token.tokenValue);
            if (this.action) this.action([token.tokenValue], latestResult.ruleDesc);
        } else {
            latestResult = new CombinatorResult(tokens.reset(), false, inbound.ruleDesc);
        }
        return latestResult;
    };
}
