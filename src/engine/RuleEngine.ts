import fs = require('fs');
import path = require('path');
import {IFeature, IGeoJsonFile} from '../models/Feature';
import {Rule, IRule, IRuleFile} from '../models/Rule';
import {WorldState}             from '../models/WorldState';
import {RuleEngineConfig}       from './RuleEngineConfig';

export interface IRuleEngineService {
    /**
     * Send update to all clients.
     * @action: logs-update, feature-update
     * @skip: this one will be skipped ( e.g original source)
     */
    updateFeature?: (feature: IFeature) => void;
    addFeature?: (feature: IFeature) => void;
    /** Update log message */
    updateLog?: (featureId: string, msgBody: {
        // [key: string]: Api.Log[];
    }) => void;

    // layer?: Layer;
    activateRule?: (ruleId: string) => void;
    deactivateRule?: (ruleId: string) => void;
    timer?: HyperTimer;
}

export class RuleEngine {
    loadedRuleFiles: string[] = [];
    isInitialised = false;
    config: RuleEngineConfig = new RuleEngineConfig();
    worldState: WorldState = new WorldState();

    constructor(private done: Function, ruleConfigFile: string = 'ruleConfig.json') {
        let ruleConfigFileAbs = path.isAbsolute(ruleConfigFile) ? ruleConfigFile : path.join(__dirname, ruleConfigFile);
        if (fs.existsSync(ruleConfigFileAbs)) {
            var configFile: RuleEngineConfig = require(ruleConfigFileAbs);
            this.config = new RuleEngineConfig(configFile);
        }
        if (this.config.rulesFolder) {
            if (!path.isAbsolute(this.config.rulesFolder)) this.config.rulesFolder = path.join(path.dirname(ruleConfigFileAbs), this.config.rulesFolder);
            this.loadRules(this.config.rulesFolder);
        }
    }

    private loadRules(rulesFolder: string) {
        if (!fs.existsSync(rulesFolder)) {
            this.done();
            return;
        };
        fs.readdir(rulesFolder, (err, files) => {
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
                    this.loadRule(rulesFolder, file);
                }
            });
            this.isInitialised = true;
            this.done();
        });
    }

    private loadRule(folder: string, file: string) {
        let ruleFile: IRuleFile = require(path.join(folder, file));
        this.loadedRuleFiles.push(file);
        if (ruleFile.imports) {
            for (var key in ruleFile.imports) {
                if (!ruleFile.imports.hasOwnProperty(key)) continue;
                let importFile = ruleFile.imports[key];
                this.loadImport(key, folder, importFile);
            }
        }
    }

    private loadImport(key: string, folder: string, file: string) {
        let importFile = path.isAbsolute(file) ? file : path.join(folder, file);
        if (!fs.existsSync(importFile)) return;
        let geojson: IGeoJsonFile = require(importFile);
        this.worldState.imports[key] = geojson.features;
    }
}