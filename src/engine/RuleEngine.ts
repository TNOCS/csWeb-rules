import fs = require('fs');
import path = require('path');
import {IFeature, IGeoJsonFile} from '../models/Feature';
import {Rule, IRule, IRuleFile} from '../models/Rule';
import {WorldState}             from '../models/WorldState';
import {RuleEngineConfig}       from './RuleEngineConfig';

export class RuleEngine {
    config: RuleEngineConfig = new RuleEngineConfig();
    worldState: WorldState = new WorldState();

    constructor() {
        if (fs.existsSync('ruleConfig.json')) {
            var configFile: RuleEngineConfig = require('ruleConfig.json');
            this.config = new RuleEngineConfig(configFile);
        }
        if (this.config.rulesFolder) {
            this.loadRules(this.config.rulesFolder);
        }
    }

    private loadRules(folder: string) {
        if (!fs.existsSync(folder)) return;
        fs.readdir(folder, (err, files) => {
            if (err) {
                console.error('Error loading rules: ' + err);
                return;
            }
            if (!files || files.length === 0) {
                console.warn('No rule files found!');
                return;
            }
            files.forEach(file => {
                if (path.extname(file) === '.json') {
                    this.loadRule(file);
                }
            });
        });
    }

    private loadRule(file: string) {
        let ruleFile: IRuleFile = require(path.join(__dirname, file));
        if (ruleFile.imports) {
            for (var key in ruleFile.imports) {
                if (!ruleFile.imports.hasOwnProperty(key)) continue;
                let importFile = ruleFile.imports[key];
                if (fs.exists(importFile, exists => {
                    // load it
                }));
            }
        }
    }
}