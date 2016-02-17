import {Token} from './Token';

/** Simple utility class to deal with tokens */
export class TokenBuffer {
    private nextIndex = 0;

    constructor(private tokens: Token[]) {}

    /** Get the next token in the list. */
    nextToken(): Token {
        return this.tokens[this.nextIndex++];
    }

    /** Returns a list of tokens that still have to be processed. */
    makePoppedTokenList() {
        return this.tokens.slice(this.nextIndex);
    }

    /** Reset the token list for the next scan. */
    reset() {
        this.nextIndex = 0;
        return this;
    }
}
