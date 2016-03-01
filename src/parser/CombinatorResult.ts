import {TokenBuffer} from '../lexer/TokenBuffer';
import {Utils}       from '../helpers/utils';

/** Simple placeholder for keeping the intermediate state during the parse, i.e. all found information can be stored here. */
export class RuleDescription {
    id:   string;
    name: string;

    [key: string]: string | number | Date | string[];

    constructor() {
        this.id = Utils.createGuid();
    }
}

export class CombinatorResult {
    constructor(private tokenBuffer: TokenBuffer, private matchStatus: boolean, public result = new RuleDescription(), private matchValue: string[] = []) {}

    /** Returns true if the match was successful. */
    matchSuccess() { return this.matchStatus; }

    /** Get the list of tokens that still need to be processed. */
    getTokenBuffer() { return this.tokenBuffer; }

    /** Get the outcome of the regular expression match, which may contain more than one group. */
    getMatchValue() { return this.matchValue; }

    /** Returns true if there remain tokens to process. */
    hasNextToken() { return this.tokenBuffer.hasNextToken(); }
}
