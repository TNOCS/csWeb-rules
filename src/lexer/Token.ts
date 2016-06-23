export enum TokenType {
    WHITESPACE,
    COMMENT,
    IMPORT,
    REQUIRE,
    NUMBER,
    STRING,
    SINGLE_QUOTE,
    DOUBLE_QUOTE,
    EQUALS,
    LE,
    LEQ,
    GE,
    GEQ,
    BRACKETS_OPEN,
    BRACKETS_CLOSE,
    PARENS_OPEN,
    PARENS_CLOSE,
    AND,
    OR,
    TRUE,
    FALSE,
    RULE,
    CONDITION,
    ACTION,
    FOR,
    ADD,
    DELETE,
    SET,
    SEND,
    EMAIL,
    FROM,
    TO,
    COMMA,
    DOT,
    MOVE,
    VIA,
    IN,
    IF,
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
    EOF,
    /** Name with dot */
    IDENTIFIER,
    /** Anything else */
    ANY
}

export class ScanRecognizer {
    constructor(public token: TokenType, public pattern: RegExp, public isOutputToken: boolean) {}
}

export class ScanRecognizers extends Array<ScanRecognizer> {
    private static instance: ScanRecognizers = new ScanRecognizers();

    constructor() {
        super();

        if (ScanRecognizers.instance){
            throw new Error('Error: Instantiation failed: Use ScanRecognizers.getInstance() instead of new.');
        }
        this.push(new ScanRecognizer(TokenType.WHITESPACE    , /^(\s)+/i, false));
        this.push(new ScanRecognizer(TokenType.COMMENT       , /^\/\/(.)*$/i, false));
        this.push(new ScanRecognizer(TokenType.IMPORT        , /^(import)\s/i, true));
        this.push(new ScanRecognizer(TokenType.REQUIRE       , /^(require)\s/i, true));
        // this.push(new ScanRecognizer(TokenType.SINGLE_QUOTE  , /^(')/, true));
        // this.push(new ScanRecognizer(TokenType.DOUBLE_QUOTE  , /^(")/, true));
        this.push(new ScanRecognizer(TokenType.EQUALS        , /^(=)\s/, true));
        this.push(new ScanRecognizer(TokenType.BRACKETS_OPEN , /^(\()/, true));
        this.push(new ScanRecognizer(TokenType.BRACKETS_CLOSE, /^(\))/, true));
        this.push(new ScanRecognizer(TokenType.PARENS_OPEN   , /^({)/, true));
        this.push(new ScanRecognizer(TokenType.PARENS_CLOSE  , /^(})/, true));
        this.push(new ScanRecognizer(TokenType.AT            , /^(at)\s/i, true));
        this.push(new ScanRecognizer(TokenType.RULE          , /^(rule)\s/i, true));
        this.push(new ScanRecognizer(TokenType.CONDITION     , /^(conditions?)\s/i, true));
        this.push(new ScanRecognizer(TokenType.ACTION        , /^(actions?)\s/i, true));
        this.push(new ScanRecognizer(TokenType.FOR           , /^(for)\s/i, true));
        this.push(new ScanRecognizer(TokenType.AFTER         , /^(after)\s/i, true));
        this.push(new ScanRecognizer(TokenType.AND           , /^(and|&&|&)\s/i, true));
        this.push(new ScanRecognizer(TokenType.LE            , /^(<)\s?/, true));
        this.push(new ScanRecognizer(TokenType.LEQ           , /^(<=)\s?/, true));
        this.push(new ScanRecognizer(TokenType.GE            , /^(>)\s?/, true));
        this.push(new ScanRecognizer(TokenType.GEQ           , /^(>=)\s?/, true));
        this.push(new ScanRecognizer(TokenType.ADD           , /^(add)\s/i, true));
        this.push(new ScanRecognizer(TokenType.SET           , /^(set)\s/i, true));
        this.push(new ScanRecognizer(TokenType.DELETE        , /^(delete)\s/i, true));
        this.push(new ScanRecognizer(TokenType.OR            , /^(or|\|\||\|)\s/i, true));
        this.push(new ScanRecognizer(TokenType.TRUE          , /^(true)/i, true));
        this.push(new ScanRecognizer(TokenType.FALSE         , /^(false)/i, true));
        this.push(new ScanRecognizer(TokenType.TO            , /^(to)\s/i, true));
        this.push(new ScanRecognizer(TokenType.IN            , /^(in)\s/i, true));
        this.push(new ScanRecognizer(TokenType.IF            , /^(if)\s/i, true));
        this.push(new ScanRecognizer(TokenType.DATE          , /^([0]?[1-9]|[1|2][0-9]|[3][0|1])[.\/-]([0]?[1-9]|[1][0-2])[.\/-]([0-9]{4}|[0-9]{2})/, true));
        this.push(new ScanRecognizer(TokenType.TIME          , /^([01]\d|2[0123]):([0-5]\d):?([0-5]\d)?/, true));
        this.push(new ScanRecognizer(TokenType.SPEED         , /^(\d+|\d+\.\d+)\s?(km\/h|m\/s)/i, true));
        this.push(new ScanRecognizer(TokenType.SEND          , /^(send)\s/i, true));
        this.push(new ScanRecognizer(TokenType.MOVE          , /^(move)\s/i, true));
        this.push(new ScanRecognizer(TokenType.VIA           , /^(via)\s/i, true));
        this.push(new ScanRecognizer(TokenType.FROM          , /^(from)\s/i, true));
        this.push(new ScanRecognizer(TokenType.EMAIL         , /^(email)\s/i, true));
        this.push(new ScanRecognizer(TokenType.ACTIVATE      , /^(activate)\s/i, true));
        this.push(new ScanRecognizer(TokenType.DEACTIVATE    , /^(deactivate)\s/i, true));
        this.push(new ScanRecognizer(TokenType.LAYER         , /^(layer)\s/i, true));
        this.push(new ScanRecognizer(TokenType.FEATURE       , /^(feature)\s/i, true));
        this.push(new ScanRecognizer(TokenType.NUMBER        , /^(\d+\.?\d+)/i, true));
        this.push(new ScanRecognizer(TokenType.IDENTIFIER    , /^(\w[\w\.\d_]+)/i, true));
        this.push(new ScanRecognizer(TokenType.STRING        , /^"(.+)"|'(.+)'/i, true));
        this.push(new ScanRecognizer(TokenType.COMMA         , /^(,)/, false));
        this.push(new ScanRecognizer(TokenType.DOT           , /^(\.)/, false));
        this.push(new ScanRecognizer(TokenType.ANY           , /^([\w\d\.\,:\\]+)/i, true));
        ScanRecognizers.instance = this;
    }

    static getInstance() { return ScanRecognizers.instance; }

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
