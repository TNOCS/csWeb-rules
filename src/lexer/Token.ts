export enum TokenType {
    WHITESPACE,
    COMMENT,
    IMPORT,
    REQUIRE,
    SINGLE_QUOTE,
    DOUBLE_QUOTE,
    EQUALS,
    PARENS_OPEN,
    PARENS_CLOSE,
    BEGIN,
    END,
    AND,
    OR,
    ADD,
    DELETE,
    SET,
    SEND,
    EMAIL,
    FROM,
    TO,
    COMMA,
    DOT,
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
    ACTIVATE,
    DEACTIVATE,
    LAYER,
    FEATURE,
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
        this.push(new ScanRecognizer(TokenType.IMPORT       , /^(import)\s/i, true));
        this.push(new ScanRecognizer(TokenType.REQUIRE      , /^(require)\s/i, true));
        this.push(new ScanRecognizer(TokenType.SINGLE_QUOTE , /^(')/, true));
        this.push(new ScanRecognizer(TokenType.DOUBLE_QUOTE , /^(")/, true));
        this.push(new ScanRecognizer(TokenType.EQUALS        , /^(=)\s/, true));
        this.push(new ScanRecognizer(TokenType.PARENS_OPEN  , /^(\()/, true));
        this.push(new ScanRecognizer(TokenType.PARENS_CLOSE , /^(\))/, true));
        this.push(new ScanRecognizer(TokenType.BEGIN        , /^({)/, true));
        this.push(new ScanRecognizer(TokenType.END          , /^(})/, true));
        this.push(new ScanRecognizer(TokenType.AT           , /^(at)\s/i, true));
        this.push(new ScanRecognizer(TokenType.AFTER        , /^(after)\s/i, true));
        this.push(new ScanRecognizer(TokenType.AND          , /^(and|&&|&)\s/i, true));
        this.push(new ScanRecognizer(TokenType.ADD          , /^(add)\s/i, true));
        this.push(new ScanRecognizer(TokenType.SET          , /^(set)\s/i, true));
        this.push(new ScanRecognizer(TokenType.DELETE       , /^(delete)\s/i, true));
        this.push(new ScanRecognizer(TokenType.OR           , /^(or|\|\||\|)\s/i, true));
        this.push(new ScanRecognizer(TokenType.TO           , /^(to)\s/i, true));
        this.push(new ScanRecognizer(TokenType.IN           , /^(in)\s/i, true));
        this.push(new ScanRecognizer(TokenType.DATE         , /^([0]?[1-9]|[1|2][0-9]|[3][0|1])[.\/-]([0]?[1-9]|[1][0-2])[.\/-]([0-9]{4}|[0-9]{2})/, true));
        this.push(new ScanRecognizer(TokenType.TIME         , /^([01]\d|2[0123]):([0-5]\d):?([0-5]\d)?/, true));
        this.push(new ScanRecognizer(TokenType.SPEED        , /^(\d+|\d+\.\d+)\s?(km\/h|m\/s)/i, true));
        this.push(new ScanRecognizer(TokenType.SEND         , /^(send)\s/i, true));
        this.push(new ScanRecognizer(TokenType.MOVE         , /^(move)\s/i, true));
        this.push(new ScanRecognizer(TokenType.VIA          , /^(via)\s/i, true));
        this.push(new ScanRecognizer(TokenType.FROM         , /^(from)\s/i, true));
        this.push(new ScanRecognizer(TokenType.EMAIL        , /^(email)\s/i, true));
        this.push(new ScanRecognizer(TokenType.ACTIVATE     , /^(activate)\s/i, true));
        this.push(new ScanRecognizer(TokenType.DEACTIVATE   , /^(deactivate)\s/i, true));
        this.push(new ScanRecognizer(TokenType.LAYER        , /^(layer)\s/i, true));
        this.push(new ScanRecognizer(TokenType.FEATURE      , /^(feature)\s/i, true));
        this.push(new ScanRecognizer(TokenType.COMMA        , /^(,)/, false));
        this.push(new ScanRecognizer(TokenType.DOT          , /^(\.)/, false));
        this.push(new ScanRecognizer(TokenType.IDENTIFIER   , /^(\w+\.\w+)\s?/i, true));
        this.push(new ScanRecognizer(TokenType.ANY          , /^([\w\d\.\,:\\]+)/i, true));
    }
}

export class Token {
    tokenType: string;

    constructor(public token: TokenType, public line: number, public column: number, public tokenValue: string[]) {
        this.tokenType = TokenType[this.token];
    }

    isTokenType(tokenMatch: TokenType) {
        return this.token === tokenMatch;
    }
}
