import * as Token from '../lexer/Token';
import * as TokenBuffer from '../lexer/TokenBuffer';

export class CombinatorResult {
    constructor(private tokenBuffer: TokenBuffer.TokenBuffer, private matchStatus: boolean, private matchValue:  string[] = []) {}

    matchSuccess() { return this.matchStatus; }

    getTokenBuffer() { return this.tokenBuffer; }
}
