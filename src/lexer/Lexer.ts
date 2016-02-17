import {Token} from './Token';
import {ScanRecognizers} from './Token';

/** A simple Regex table lexer that scans the input file and generates a list of tokens as output. */
export class Lexer {
    private eol = /^\s*\r?\n/;

    private scannerBuffer:   string;
    private patternMatchers: ScanRecognizers = new ScanRecognizers();
    private bufferLength:    number;
    private line:            number = 1;
    private column:          number = 1;

    tokenList: Array<Token> = [];

    analyse(buffer: string) {
        this.scannerBuffer = buffer;
        this.bufferLength = this.scannerBuffer.length;

        var parseInProgress = true;
        while (parseInProgress) {
            parseInProgress = this.matchToken();
            this.updateLineAndColumn();
        }
    }

    reset() {
        this.scannerBuffer = '';
        this.bufferLength  = -1;
        this.tokenList     = [];
    }

    /**
     * Update the line and column number.
     */
    private updateLineAndColumn() {
        this.column += this.bufferLength - this.scannerBuffer.length;
        var pattern = this.eol.exec(this.scannerBuffer);
        if (pattern) {
            this.scannerBuffer = this.scannerBuffer.substr(pattern[0].length);
            this.line++;
            this.column = 1;
        }
        this.bufferLength = this.scannerBuffer.length;
    }

    private matchToken() {
        var tokenMatch = false;

        this.patternMatchers.some(pm => {
            var pattern = pm.pattern.exec(this.scannerBuffer);
            if (pattern) {
                tokenMatch = true;
                if (pm.isOutputToken) {
                    var matches: string[] = [];
                    // The first match is the whole matching string: if we only have two patterns, the second equals the first, so skip it. 
                    for (let i = 0, length = pattern.length === 2 ? 1 : pattern.length; i < length; i++) {
                        matches.push(pattern[i]);
                    }
                    this.tokenList.push(new Token(pm.token, this.line, this.column, matches));
                }
                this.scannerBuffer = this.scannerBuffer.substr(pattern[0].length);
            }
            return tokenMatch;
        });
        return tokenMatch;
    }
}
