import {Lexer} from '../../src/lexer/Lexer';
import {Token} from '../../src/lexer/Token';
import {TokenType} from '../../src/lexer/Token';

describe('The lexer', function() {
    var lexer: Lexer;

    beforeEach(() => {
        lexer = new Lexer();
    });

    it('should recognize spaces.', () => {
        lexer.analyse('   ');
        expect(lexer.tokenList.length).toBe(0);
    });

    it('should recognize comments.', () => {
        lexer.analyse('// import bla bla ');
        expect(lexer.tokenList.length).toBe(0);
    });

    it('should recognize (one word) string.', () => {
        lexer.analyse('hello ');
        expect(lexer.tokenList.length).toBe(1);
        expect(lexer.tokenList[0].tokenValue[0]).toBe('hello');
        expect(lexer.tokenList[0].token === TokenType.STRING);
    });

    it('should recognize a number.', () => {
        lexer.analyse('314 ');
        expect(lexer.tokenList.length).toBe(1);
        expect(lexer.tokenList[0].tokenValue[0]).toBe('314');
        expect(lexer.tokenList[0].token === TokenType.NUMBER);
    });

    it('should recognize a float.', () => {
        lexer.analyse('3.14 ');
        expect(lexer.tokenList.length).toBe(1);
        expect(lexer.tokenList[0].tokenValue[0]).toBe('3.14');
        expect(lexer.tokenList[0].token === TokenType.NUMBER);
    });

    it('should count lines.', () => {
        lexer.analyse('Hello, world\nbla1\nbla2');
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
        expect(lexer.tokenList.length).toBe(7);
    });

    it ('should recognize a time command', () => {
        lexer.analyse('At 28-02-2016 10:00');
        //console.log(lexer.tokenList);
        expect(lexer.tokenList.length).toBe(3);
        expect(lexer.tokenList[0].token === TokenType.AT);
        expect(lexer.tokenList[1].token === TokenType.DATE);
        expect(lexer.tokenList[2].token === TokenType.TIME);
    });

    it ('should recognize a timespan command', () => {
        lexer.analyse('After 00:10:00');
        // console.log(lexer.tokenList);
        expect(lexer.tokenList.length).toBe(2);
        expect(lexer.tokenList[0].token === TokenType.AFTER);
        expect(lexer.tokenList[1].token === TokenType.TIME);
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
        expect(lexer.tokenList[9].token).toBe(TokenType.TIME);
    });

    it ('should recognize an activate/deactivate layer command (by ID)', () => {
        lexer.analyse('Activate layer layerID');
        // console.log(lexer.tokenList);
        expect(lexer.tokenList.length).toBe(3);
        expect(lexer.tokenList[0].token).toBe(TokenType.ACTIVATE);
        expect(lexer.tokenList[1].token).toBe(TokenType.LAYER);
        lexer.reset();
        lexer.analyse('Deactivate layer layerID');
        expect(lexer.tokenList.length).toBe(3);
        expect(lexer.tokenList[0].token).toBe(TokenType.DEACTIVATE);
        expect(lexer.tokenList[1].token).toBe(TokenType.LAYER);
    });

    it ('should recognize an add/delete layer command (by filename)', () => {
        lexer.analyse('Add layer "c:\\my\\new\\layer.json" to group');
        // console.log(lexer.tokenList);
        expect(lexer.tokenList.length).toBe(5);
        expect(lexer.tokenList[0].token).toBe(TokenType.ADD);
        expect(lexer.tokenList[1].token).toBe(TokenType.LAYER);
        expect(lexer.tokenList[3].token).toBe(TokenType.TO);
        expect(lexer.tokenList[4].token).toBe(TokenType.IDENTIFIER);
        lexer.reset();
        lexer.analyse('Delete layer layerID');
        expect(lexer.tokenList.length).toBe(3);
        expect(lexer.tokenList[0].token).toBe(TokenType.DELETE);
        expect(lexer.tokenList[1].token).toBe(TokenType.LAYER);
        expect(lexer.tokenList[2].token).toBe(TokenType.IDENTIFIER);
    });

    it ('should recognize an add/delete feature command to the active layer', () => {
        lexer.analyse('Add feature assets.car');
        // console.log(lexer.tokenList);
        expect(lexer.tokenList.length).toBe(3);
        expect(lexer.tokenList[0].token).toBe(TokenType.ADD);
        expect(lexer.tokenList[1].token).toBe(TokenType.FEATURE);
        expect(lexer.tokenList[2].token).toBe(TokenType.IDENTIFIER);
        lexer.reset();
        lexer.analyse('Delete feature assets.car');
        // console.log(lexer.tokenList);
        expect(lexer.tokenList.length).toBe(3);
        expect(lexer.tokenList[0].token).toBe(TokenType.DELETE);
        expect(lexer.tokenList[1].token).toBe(TokenType.FEATURE);
        expect(lexer.tokenList[2].token).toBe(TokenType.IDENTIFIER);
    });

    it ('should recognize a set property command', () => {
        lexer.analyse('Activate feature featureID');
        // console.log(lexer.tokenList);
        expect(lexer.tokenList.length).toBe(3);
        expect(lexer.tokenList[0].token).toBe(TokenType.ACTIVATE);
        expect(lexer.tokenList[1].token).toBe(TokenType.FEATURE);
        expect(lexer.tokenList[2].token).toBe(TokenType.IDENTIFIER);
        lexer.reset();
        lexer.analyse('Set isAnswered = true');
        // console.log(lexer.tokenList);
        expect(lexer.tokenList.length).toBe(4);
        expect(lexer.tokenList[0].token).toBe(TokenType.SET);
        expect(lexer.tokenList[1].token).toBe(TokenType.IDENTIFIER);
        expect(lexer.tokenList[2].token).toBe(TokenType.EQUALS);
        expect(lexer.tokenList[3].token).toBe(TokenType.TRUE);
        lexer.reset();
        lexer.analyse('Set age = 45');
        // console.log(lexer.tokenList);
        expect(lexer.tokenList.length).toBe(4);
        expect(lexer.tokenList[3].token).toBe(TokenType.NUMBER);
    });

    it ('should recognize a sequence of identifiers, separated by commas.', () => {
        lexer.analyse('users.erik, users.bert, users.cor.');
        expect(lexer.tokenList.length).toBe(3);
        expect(lexer.tokenList[0].token).toBe(TokenType.IDENTIFIER);
        expect(lexer.tokenList[1].token).toBe(TokenType.IDENTIFIER);
        expect(lexer.tokenList[2].token).toBe(TokenType.IDENTIFIER);
    });

    it ('should recognize new rules.', () => {
        lexer.analyse('Rule');
        expect(lexer.tokenList.length).toBe(1);
        expect(lexer.tokenList[0].token).toBe(TokenType.RULE);
    });

    it ('should recognize new rules for specific features.', () => {
        lexer.analyse('Rule for featureID');
        expect(lexer.tokenList.length).toBe(3);
        expect(lexer.tokenList[0].token).toBe(TokenType.RULE);
        expect(lexer.tokenList[1].token).toBe(TokenType.FOR);
        expect(lexer.tokenList[2].token).toBe(TokenType.IDENTIFIER);
    });

    it ('should recognize new rules for specific features with condition.', () => {
        lexer.analyse('Rule for featureID\nConditions');
        expect(lexer.tokenList.length).toBe(4);
        expect(lexer.tokenList[0].token).toBe(TokenType.RULE);
        expect(lexer.tokenList[1].token).toBe(TokenType.FOR);
        expect(lexer.tokenList[2].token).toBe(TokenType.IDENTIFIER);
        expect(lexer.tokenList[3].token).toBe(TokenType.CONDITION);
    });

});
