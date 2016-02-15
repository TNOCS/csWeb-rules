import Token = require('./Token');

/** A simple Regex table lexer that scans the input file and generates a list of tokens as output. */
export class Lexer {
    private scannerBuffer: string;
    private patternMatchers: Token.ScanRecognizers = new Token.ScanRecognizers();

    tokenList: Array<Token.Token> = [];

    analyse(buffer: string) {
        this.scannerBuffer = buffer;

        var parseInProgress = true;
        while (parseInProgress) {
            parseInProgress = this.matchToken();
        }
    }

    private matchToken() {
        var tokenMatch = false;

        this.patternMatchers.some(pm => {
            var pattern = pm.pattern.exec(this.scannerBuffer);
            if (pattern) {
                tokenMatch = true;
                if (pm.isOutputToken) {
                    this.tokenList.push(new Token.Token(pm.token, pattern[0]));
                }
                this.scannerBuffer = this.scannerBuffer.substr(pattern[0].length);
            }
            return tokenMatch;
        });
        return tokenMatch;
    }
}