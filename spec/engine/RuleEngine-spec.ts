import {RuleEngine} from '../../src/engine/RuleEngine';
import {RuleEngineConfig, IRuleEngineConfig} from '../../src/engine/RuleEngineConfig';

describe('The rule engine', () => {
    var ruleEngine: RuleEngine;
    const config: IRuleEngineConfig = {
        rulesFolder: './spec/test_data/rules'
    };

    beforeEach(done => {
        ruleEngine = new RuleEngine(done, config);
    });

    it('should use a default folder for rules.', (done) => {
        let re = new RuleEngine(done, new RuleEngineConfig());
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
