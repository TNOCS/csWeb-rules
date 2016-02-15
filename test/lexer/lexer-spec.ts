import Lexer = require('../../src/lexer/Lexer');

describe('The lexer', function() {
    var lexer: Lexer.Lexer;

    beforeEach(() => {
        lexer = new Lexer.Lexer();
    });

    it('should recognize spaces.', () => {
        lexer.analyse('   ');
        expect(lexer.tokenList.length).toBe(0);
    });

    it('should recognize comments.', () => {
        lexer.analyse('// import bla bla ');
        expect(lexer.tokenList.length).toBe(0);
    });

    it('should recognize an AND statement.', () => {
        lexer.tokenList = [];
        lexer.analyse('AND');
        expect(lexer.tokenList.length).toBe(1);
        lexer.tokenList = [];
        lexer.analyse('and');
        expect(lexer.tokenList.length).toBe(1);
        lexer.tokenList = [];
        lexer.analyse('&');
        expect(lexer.tokenList.length).toBe(1);
        lexer.tokenList = [];
        lexer.analyse('&&');
        expect(lexer.tokenList.length).toBe(1);
    });

    it('should recognize import and require keywords.', () => {
        lexer.analyse('import require');
        expect(lexer.tokenList.length).toBe(2);
    });

    it('should recognize an import statement.', () => {
        lexer.analyse('import users = require(\'users\')');
        //console.log(lexer.tokenList);
        expect(lexer.tokenList.length).toBe(9);
    });

    it ('should recognize a time command', () => {
        lexer.analyse('At 28-02-2016 10:00');
        console.log(lexer.tokenList);
        expect(lexer.tokenList.length).toBe(2);
    });
});
