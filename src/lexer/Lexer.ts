import Token = require('./Token');

/** A simple Regex table lexer that scans the input file and generates a list of tokens as output. */
export class Lexer {
    private eol = /^\s*\r?\n/;

    private scannerBuffer:   string;
    private patternMatchers: Token.ScanRecognizers = new Token.ScanRecognizers();
    private bufferLength:    number;
    private line:            number = 1;
    private column:          number = 1;

    tokenList: Array<Token.Token> = [];

    analyse(buffer: string) {
        this.scannerBuffer = buffer;
        this.bufferLength = this.scannerBuffer.length;

        var parseInProgress = true;
        while (parseInProgress) {
            parseInProgress = this.matchToken();
            this.updateLineAndColumn();
        }
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
                    this.tokenList.push(new Token.Token(pm.token, this.line, this.column, pattern));
                }
                this.scannerBuffer = this.scannerBuffer.substr(pattern[0].length);
            }
            return tokenMatch;
        });
        return tokenMatch;
    }
}
