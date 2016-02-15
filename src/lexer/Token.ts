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
    TIMESPAN,
    DATE,
    SPEED,
    /** Name with dot */
    IDENTIFIER,
    /** Anything else */
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
        this.push(new ScanRecognizer(TokenType.AT           , /^(at)/i, true));
        this.push(new ScanRecognizer(TokenType.AFTER        , /^(after)/i, true));
        this.push(new ScanRecognizer(TokenType.AND          , /^(and|&&|&)/i, true));
        this.push(new ScanRecognizer(TokenType.OR           , /^(or|\|\||\|)/i, true));
        this.push(new ScanRecognizer(TokenType.DATE         , /^([0]?[1-9]|[1|2][0-9]|[3][0|1])[.\/-]([0]?[1-9]|[1][0-2])[.\/-]([0-9]{4}|[0-9]{2})/, true));
        this.push(new ScanRecognizer(TokenType.TIME         , /^([01]\d|2[0123])[:]([0-5]\d)[:]?([0-5]\d)?/, true));
        this.push(new ScanRecognizer(TokenType.ANY         , /^([\w\d\.\,]+)/i, true));
        this.push(new ScanRecognizer(TokenType.IDENTIFIER   , /^(\w+\.\w+)/i, true));
    }
}

export class Token {
    tokenType: string;

    constructor(public token: TokenType, public line: number, public column: number, public match: string[]) {
        this.tokenType = TokenType[this.token];
    }
}
