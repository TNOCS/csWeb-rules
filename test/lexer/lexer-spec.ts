import Lexer = require('../../src/lexer/Lexer');
import Token = require('../../src/lexer/Token');

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

    it('should count lines.', () => {
        lexer.analyse('Hello, world\r\nbla1\nbla2');
        // console.log(lexer.tokenList);
        expect(lexer.tokenList.length).toBe(4);
        expect(lexer.tokenList[0].line).toBe(1);
        expect(lexer.tokenList[1].line).toBe(1);
        expect(lexer.tokenList[2].line).toBe(2);
        expect(lexer.tokenList[3].line).toBe(3);
    });

    it('should recognize an AND statement.', () => {
        lexer.analyse('AND ');
        expect(lexer.tokenList.length).toBe(1);
        lexer.reset();
        lexer.analyse('and ');
        expect(lexer.tokenList.length).toBe(1);
        lexer.reset();
        lexer.analyse('& ');
        expect(lexer.tokenList.length).toBe(1);
        lexer.reset();
        lexer.analyse('&& ');
        expect(lexer.tokenList.length).toBe(1);
    });

    it('should recognize import and require keywords.', () => {
        lexer.analyse('import require');
        expect(lexer.tokenList.length).toBe(2);
    });

    it('should recognize an import statement.', () => {
        lexer.analyse('import users = require(\'users\')');
        // console.log(lexer.tokenList);
        expect(lexer.tokenList.length).toBe(9);
    });

    it ('should recognize a time command', () => {
        lexer.analyse('At 28-02-2016 10:00');
        //console.log(lexer.tokenList);
        expect(lexer.tokenList.length).toBe(3);
        expect(lexer.tokenList[0].token === Token.TokenType.AT);
        expect(lexer.tokenList[1].token === Token.TokenType.DATE);
        expect(lexer.tokenList[2].token === Token.TokenType.TIME);
    });

    it ('should recognize a timespan command', () => {
        lexer.analyse('After 00:10:00');
        // console.log(lexer.tokenList);
        expect(lexer.tokenList.length).toBe(2);
        expect(lexer.tokenList[0].token === Token.TokenType.AFTER);
        expect(lexer.tokenList[1].token === Token.TokenType.TIME);
    });

    it ('should recognize an email message', () => {
        lexer.analyse(`Send email emails.weatherForecast
            from users.Erik
            to users.Peter, users.Frank`);
        // console.log(lexer.tokenList);
        expect(lexer.tokenList.length).toBe(8);
    });

    it ('should recognize a move command', () => {
        lexer.analyse('Move to geo.Location3 via geo.path2 at 50km/h.');
        // console.log(lexer.tokenList);
        expect(lexer.tokenList.length).toBe(7);
        lexer.reset();
        lexer.analyse('Move to geo.Location3 via geo.path2 at 50.1234 km/h.');
        // console.log(lexer.tokenList);
        expect(lexer.tokenList.length).toBe(7);
        lexer.reset();
        lexer.analyse('Move to geo.Location3 via geo.path2 at 50 m/s.');
        // console.log(lexer.tokenList);
        expect(lexer.tokenList.length).toBe(7);
        lexer.reset();
        lexer.analyse('Move to geo.Location3 via geo.path2 in 15:30.');
        // console.log(lexer.tokenList);
        expect(lexer.tokenList.length).toBe(7);
        lexer.reset();
        lexer.analyse('Move assets.Car from geo.Location1 to geo.Location2 via geo.path1 in 00:15:00.');
        // console.log(lexer.tokenList);
        expect(lexer.tokenList.length).toBe(10);
        expect(lexer.tokenList[9].token).toBe(Token.TokenType.TIME);
    });
});
