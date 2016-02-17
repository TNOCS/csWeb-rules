import * as combinator from './Combinator';
import * as cr from './CombinatorResult';
import * as token from '../lexer/Token';
import * as tb from '../lexer/TokenBuffer';

export class TerminalParser extends combinator.Combinator {
    private tokenMatch: token.TokenType;

    constructor(match: token.TokenType) {
        super();
        this.tokenMatch = match;
    }

    recognizer(inbound: cr.CombinatorResult) {
        if (!inbound.matchSuccess()) {
            return inbound;
        }
        var result: cr.CombinatorResult,
            tokens = inbound.getTokenBuffer(),
            token = tokens.nextToken();
        if (token.isTokenType(this.tokenMatch)) {
            var outTokens = new tb.TokenBuffer(tokens.makePoppedTokenList());
            result = new cr.CombinatorResult(outTokens, true, token.tokenValue);
            this.action(token.tokenValue);
        } else {
            result = new cr.CombinatorResult(tokens.reset(), false);
        }
        return result;
    };

    action(matchValue: string[]) { return; }
}
