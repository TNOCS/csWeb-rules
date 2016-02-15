import Token = require('./Token');

/** A list of keywords and the regex required to parse them. */
export class ScannerPatterns {
    patternMatchers: Token.ScanRecognizers = new Token.ScanRecognizers();
}
