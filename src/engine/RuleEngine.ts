import fs = require('fs');
import path = require('path');
import {Rule, IRule, IRuleFile} from '../models/Rule';
import {WorldState}             from '../models/WorldState';
import {RuleEngineConfig}       from './RuleEngineConfig';

export interface IRuleEngineService {
    /**
     * Send update to all clients.
     * @action: logs-update, feature-update
     * @skip: this one will be skipped ( e.g original source)
     */
    updateFeature?: (feature: GeoJSON.Feature<GeoJSON.GeometryObject>) => void;
    addFeature?: (feature: GeoJSON.Feature<GeoJSON.GeometryObject>) => void;
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
                let importFileReference = ruleFile.imports[key];
                this.importGeoJSON(key, folder, importFileReference);
            }
        }
        if (ruleFile.subscribtions) {
            let subscribtions = ruleFile.subscribtions;
            //subscribtions.
        }
    }

    private importGeoJSON(key: string, folder: string, fileReference: { path: string, referenceId?: string}) {
        let importFile = path.isAbsolute(fileReference.path) ? fileReference.path : path.join(folder, fileReference.path);
        if (!fs.existsSync(importFile)) return;
        let geojson: GeoJSON.FeatureCollection<GeoJSON.GeometryObject> = require(importFile);
        if (!geojson || !geojson.features || geojson.features.length === 0) return;
        if (this.worldState.hasOwnProperty(key)) {
            console.error(`Error importing ${importFile}: Key ${key} already exists!`);
            return;
        }
        let importedFeatures: { [key: string]: GeoJSON.Feature<GeoJSON.GeometryObject>} = {};
        geojson.features.forEach(f => {
            let key = (fileReference.referenceId && f.properties && f.properties.hasOwnProperty(fileReference.referenceId))
                ? f.properties[fileReference.referenceId]
                : f.id;
            if (!key && f.properties) {
                if (f.properties.hasOwnProperty['Name']) {
                    key = f.properties['Name'];
                } else if (f.properties.hasOwnProperty['name']) {
                    key = f.properties['name'];
                }
            }
            if (!key) {
                console.error(`Error importing feature from ${importFile}: feature has no key (id, name or Name property)! Feature:\n ${JSON.stringify(f, null, 2)}`);
                return;
            }
            if (importedFeatures.hasOwnProperty(key)) {
                console.error(`Error importing feature from ${importFile}: Key ${key} already exitst! Feature:\n ${JSON.stringify(f, null, 2)}`);
                return;
            } else {
                importedFeatures[key] = f;
            }
        });
        this.worldState.imports[key] = importedFeatures;
    }
}
