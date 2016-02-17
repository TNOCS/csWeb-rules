import {TokenType} from '../lexer/Token';
import {CombinatorResult} from './CombinatorResult';
import {Combinator} from './Combinator';
import {TokenBuffer} from '../lexer/TokenBuffer';

export class TerminalParser extends Combinator {
    private tokenMatch: TokenType;

    constructor(match: TokenType) {
        super();
        this.tokenMatch = match;
    }

    recognizer(inbound: CombinatorResult) {
        if (!inbound.matchSuccess()) {
            return inbound;
        }
        var result: CombinatorResult,
            tokens = inbound.getTokenBuffer(),
            token = tokens.nextToken();
        if (token.isTokenType(this.tokenMatch)) {
            var outTokens = new TokenBuffer(tokens.makePoppedTokenList());
            result = new CombinatorResult(outTokens, true, token.tokenValue);
            this.action(token.tokenValue);
        } else {
            result = new CombinatorResult(tokens.reset(), false);
        }
        return result;
    };

    action(matchValue: string[]) { return; }
}
