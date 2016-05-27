import {TokenBuffer} from '../lexer/TokenBuffer';
import {Utils}       from '../helpers/utils';

/** Simple placeholder for keeping the intermediate state during the parse, i.e. all found information can be stored here. */
export class RuleDescription {
    id:   string;
    name: string;
    method: string;
    description: string;

    [key: string]: string | number | Date | string[] | Object;

    constructor() {
        this.id = Utils.createGuid();
    }
}

export class CombinatorResult {
    constructor(private tokenBuffer: TokenBuffer, private matchStatus: boolean, public ruleDesc = new RuleDescription(), private matchValue: string[] = []) {}

    /** Get the list of tokens that still need to be processed. */
    getTokenBuffer() { return this.tokenBuffer; }

    /** Get the outcome of the regular expression match, which may contain more than one group. */
    getMatchValue() { return this.matchValue; }

    /** Returns true if the match was successful. */
    get matchSuccess() { return this.matchStatus; }

    /** Returns true if there remain tokens to process. */
    get hasNextToken() { return this.tokenBuffer.hasNextToken; }

    /** Tells you how many tokens still remain in the buffer. */
    get remainingTokensInBuffer() { return this.tokenBuffer.remaingingTokensInBuffer; }
}
