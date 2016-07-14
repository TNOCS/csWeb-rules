import {RuleEngine} from '../../src/engine/RuleEngine';

describe('The rule engine', () => {
    var ruleEngine: RuleEngine;

    beforeEach(done => {
        ruleEngine = new RuleEngine(done, '../../../spec/engine/ruleConfig.json');
    });

    it('should use a default folder for rules.', (done) => {
        let re = new RuleEngine(done);
        expect(re.config.rulesFolder).toContain('rules');
    });

    it('should load a config file.', (done) => {
        expect(ruleEngine.config.rulesFolder).toContain('test_data');
        done();
    });

    it('should be able to load a rule file.', (done) => {
        expect(ruleEngine.loadedRuleFiles.indexOf('importRule.json')).toBeGreaterThan(-1);
        done();
    });

    it('should be able to import geojson data.', () => {
        expect(ruleEngine.worldState.imports.hasOwnProperty('areas')).toBeTruthy();
    });

});
