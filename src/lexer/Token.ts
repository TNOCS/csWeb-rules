export enum TokenType {
    WHITESPACE,
    COMMENT,
    IMPORT,
    REQUIRE,
    SINGLE_QUOTE,
    DOUBLE_QUOTE,
    EQUAL,
    PARENS_OPEN,
    PARENS_CLOSE,
    BEGIN,
    END,
    AND,
    OR,
    SEND,
    EMAIL,
    FROM,
    TO,
    WITH_SUBJECT,
    AND_ATTACHMENT,
    AND_BODY,
    MOVE,
    VIA,
    IN,
    AT,
    AFTER,
    TIME,
    SPEED,
    /** Name with dot */
    IDENTIFIER,
    /** Single name */
    NAME,
    KEYWORD,
    ANY,
    EOF
}

export class ScanRecognizer {
    constructor(public token: TokenType, public pattern: RegExp, public isOutputToken: boolean) {}
}

export class ScanRecognizers extends Array<ScanRecognizer> {
    constructor() {
        super();
        this.push(new ScanRecognizer(TokenType.WHITESPACE   , /^(\s)+/i, false));
        this.push(new ScanRecognizer(TokenType.COMMENT      , /^\/\/(.)*$/i, false));
        this.push(new ScanRecognizer(TokenType.IMPORT       , /^(import)/i, true));
        this.push(new ScanRecognizer(TokenType.REQUIRE      , /^(require)/i, true));
        this.push(new ScanRecognizer(TokenType.SINGLE_QUOTE , /^(')/, true));
        this.push(new ScanRecognizer(TokenType.DOUBLE_QUOTE , /^(")/, true));
        this.push(new ScanRecognizer(TokenType.EQUAL        , /^(=)/, true));
        this.push(new ScanRecognizer(TokenType.PARENS_OPEN  , /^(\()/, true));
        this.push(new ScanRecognizer(TokenType.PARENS_CLOSE , /^(\))/, true));
        this.push(new ScanRecognizer(TokenType.BEGIN        , /^({)/, true));
        this.push(new ScanRecognizer(TokenType.END          , /^(})/, true));
        this.push(new ScanRecognizer(TokenType.AND          , /^(and|&&|&)/i, true));
        this.push(new ScanRecognizer(TokenType.OR           , /^(or|\|\||\|)/i, true));
        this.push(new ScanRecognizer(TokenType.NAME         , /^(\w+)/i, true));
        this.push(new ScanRecognizer(TokenType.IDENTIFIER   , /^(\w+\.\w+)/i, true));
    }
}

export class Token {
    tokenType: string;

    constructor(public token: TokenType, public match: string, public line?: number, public column?: number) {
        this.tokenType = TokenType[this.token];
    }
}
