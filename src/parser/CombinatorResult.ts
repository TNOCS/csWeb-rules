import{TokenBuffer} from '../lexer/TokenBuffer';

export class CombinatorResult {
    constructor(private tokenBuffer: TokenBuffer, private matchStatus: boolean, private matchValue: string[] = []) {}

    matchSuccess() { return this.matchStatus; }

    getTokenBuffer() { return this.tokenBuffer; }

    getMatchValue() { return this.matchValue; }

    hasNextToken() { return this.tokenBuffer.hasNextToken(); }
}
