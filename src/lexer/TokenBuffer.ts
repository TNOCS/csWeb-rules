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

    /** Returns true if there is at least one token in the buffer. */
    get hasNextToken() {
        return this.nextIndex < this.tokens.length;
    }

    /** Tells you how many tokens still remain in the buffer. */
    get remaingingTokensInBuffer(): number {
        return this.tokens.length;
    }

    /** Reset the token list for the next scan. */
    reset() {
        this.nextIndex = 0;
        return this;
    }
}
