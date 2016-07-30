import fs = require('fs');
import path = require('path');
import HyperTimer = require('hypertimer');
import winston = require('winston');
import {IRuleEngineConfig, RuleEngineConfig}  from './RuleEngineConfig';
import {Rule, IRule, IRuleFile}               from '../models/Rule';
import {IAction, IActionPlugin}               from '../models/Action';
import {ICondition, IConditionPlugin}         from '../models/Condition';
import {WorldState}                           from '../models/WorldState';
import {ISourceConnectorConfig}               from '../router/connectors/SourceConnector';
import {ISinkConnectorConfig}                 from '../router/connectors/SinkConnector';
import {Router}                               from '../router/Router';

var logger = new winston.Logger({
  level: 'debug',
  transports: [
    new winston.transports.Console()
    // , new winston.transports.File({ filename: 'somefile.log' })
  ]
});

export interface IRuleEngineService {
  /**
   * Send update to all clients.
   * @action: logs-update, feature-update
   * @skip: this one will be skipped ( e.g original source)
   */
  // updateFeature?: (feature: GeoJSON.Feature<GeoJSON.GeometryObject>) => void;
  // addFeature?: (feature: GeoJSON.Feature<GeoJSON.GeometryObject>) => void;
  /** Update log message */
  // updateLog?: (featureId: string, msgBody: {
  //     // [key: string]: Api.Log[];
  // }) => void;

  // layer?: Layer;
  /**
   * Activate a rule
   *
   * @param {string} ruleId: id of the rule to activate.
   */
  activateRule?: (ruleId: string) => void;
  /**
   * Deactivate a rule
   *
   * @param {string} ruleId: id of the rule to deactivate.
   */
  deactivateRule?: (ruleId: string) => void;
  timer?: HyperTimer;
  router?: Router;
  logger?: winston.LoggerInstance;
}

export class RuleEngine {
  loadedRuleFiles: string[] = [];
  isInitialised = false;
  router: Router = new Router();
  /** A set of rules. */
  private rules: IRule[] = [];
  // /** A set of rules that are active but have not yet fired. */
  // private activeRules: IRule[] = [];
  // /** A set of rules that are inactive and may become activated. */
  // private inactiveRules: IRule[] = [];
  // /** A set of rules to activate at the end of the rule evaluation cycle */
  // private activateRules: string[] = [];
  // /** A set of rules to deactivate at the end of the rule evaluation cycle */
  // private deactivateRules: string[] = [];
  /** Unprocessed features that haven't been evaluated yet */
  private featureQueue: GeoJSON.Feature<GeoJSON.GeometryObject>[] = [];
  private isBusy: boolean;
  service: IRuleEngineService = {};
  worldState: WorldState = new WorldState();

  /**
   * A list of actions that are dynamically loaded from the actions folder.
   *
   * @type {{ [key: string]: IActionPlugin }}
   */
  actions: { [key: string]: IActionPlugin } = {};
  /**
   * A list of conditions that are dynamically loaded from the conditions folder.
   *
   * @type {{ [key: string]: IConditionPlugin }}
   */
  conditions: { [key: string]: IConditionPlugin } = {};

  /**
   * Creates an instance of RuleEngine.
   *
   * @param {Function} done
   * @param {string} [ruleConfigFile='ruleConfig.json']
   */
  constructor(private done: Function, public config: IRuleEngineConfig) {
    this.config = new RuleEngineConfig(config);
    this.loadConditionPlugins();
    this.loadActionPlugins();

    // this.service.updateFeature = (feature: Feature) => manager.updateFeature(layerId, feature, {}, () => {});
    // this.service.addFeature = (feature: Feature) => manager.addFeature(layerId, feature, {}, () => {});
    // this.service.updateLog = (featureId: string, logs: {
    //     [key: string]: Api.Log[];
    // }) => manager.updateLogs(layerId, featureId, logs, {}, () => {});
    // this.service.layer = this.layer;
    this.service.activateRule = (ruleId: string) => this.activateRule(ruleId);
    this.service.deactivateRule = (ruleId: string) => this.deactivateRule(ruleId);
    this.service.timer = new HyperTimer();
    this.service.router = this.router;
    this.service.logger = logger;

    if (this.config.rulesFolder) {
      // if (!path.isAbsolute(this.config.rulesFolder)) this.config.rulesFolder = path.join(process.cwd(), this.config.rulesFolder);
      this.loadRuleFiles(this.config.rulesFolder);
    }
  }

  /**
   * Load the action plugins. If none are found, the rule engine is basically
   * powerless, and so we throw an error.
   *
   * @private
   */
  private loadConditionPlugins() {
    // let actionFolder = path.join(__dirname, '../conditions');
    let conditionsFolder = this.config.actionsFolder;
    if (fs.existsSync(conditionsFolder)) {
      let files = fs.readdirSync(conditionsFolder);
      if (files && files.length > 0) {
        files.forEach(f => {
          if (path.extname(f) !== '.js') return;
          let file = path.join(conditionsFolder, f);
          let plugin: IConditionPlugin = require(file);
          this.conditions[path.basename(f).replace(/\.js/, '').toLowerCase()] = plugin;
        });
      } else {
        throw Error('No actions found!');
      }
    }
  }

  /**
   * Load the action plugins. If none are found, the rule engine is basically
   * powerless, and so we throw an error.
   *
   * @private
   */
  private loadActionPlugins() {
    // let actionFolder = path.join(__dirname, '../actions');
    let actionsFolder = this.config.actionsFolder;
    if (fs.existsSync(actionsFolder)) {
      let files = fs.readdirSync(actionsFolder);
      if (files && files.length > 0) {
        files.forEach(f => {
          if (path.extname(f) !== '.js') return;
          let file = path.join(actionsFolder, f);
          let plugin: IActionPlugin = require(file);
          this.actions[path.basename(f).replace(/\.js/, '').toLowerCase()] = plugin;
        });
      } else {
        throw Error('No actions found!');
      }
    }
  }

  private loadRuleFiles(rulesFolder: string) {
    if (!fs.existsSync(rulesFolder)) {
      return this.done();
    };
    fs.readdir(rulesFolder, (err, files) => {
      if (err) {
        logger.error('Error loading rules: ' + err);
        return;
      }
      if (!files || files.length === 0) {
        logger.warn('No rule files found!');
        return;
      }
      files.forEach(file => {
        if (path.extname(file) === '.json') {
          this.loadRuleFile(rulesFolder, file);
        }
      });
      this.isInitialised = true;
      this.evaluateRules();
      this.done();
    });
  }

  private loadRuleFile(folder: string, file: string) {
    let ruleFile: IRuleFile = require(path.join(folder, file));
    this.loadedRuleFiles.push(file);
    if (ruleFile.imports) {
      for (var key in ruleFile.imports) {
        if (!ruleFile.imports.hasOwnProperty(key)) continue;
        let importFileReference = ruleFile.imports[key];
        this.importGeoJSON(key, folder, importFileReference);
      }
    }
    if (ruleFile.subscribers) {
      this.subscribeSources(ruleFile.subscribers);
    }
    if (ruleFile.publishers) {
      this.subscribeSinks(ruleFile.publishers);
    }
    if (ruleFile.rules) {
      ruleFile.rules.forEach(r => {
        if (r.conditions && r.conditions.length > 0) this.attachConditions(r);
        if (r.actions && r.actions.length > 0) this.attachActions(r);
      });
    }
  }

  private attachConditions(r: IRule) {
    let executableConditions: IAction[] = [];
    r.conditions.forEach(c => {
      if (!c.method) return;
      let plugin = this.conditions[c.method.toLowerCase()];
      if (!plugin) {
        logger.warn(`Condition ${c.method} not found in rule ${r.id}! Skipping.`);
        return;
      }
      c.evaluate = plugin.evaluate(this.service, c.property);
      executableConditions.push(c);
    });
    if (executableConditions.length === 0) return;
    r.conditions = executableConditions;
    this.rules.push(new Rule(r));
  }

  private attachActions(r: IRule) {
    let executableActions: IAction[] = [];
    r.actions.forEach(a => {
      if (!a.method) return;
      let plugin = this.actions[a.method.toLowerCase()];
      if (!plugin) {
        logger.warn(`Action ${a.method} not found in rule ${r.id}! Skipping.`);
        return;
      }
      a.run = plugin.run(this.service, a.property);
      executableActions.push(a);
    });
    if (executableActions.length === 0) return;
    r.actions = executableActions;
    this.rules.push(new Rule(r));
  }

  private subscribeSinks(publishers: { [key: string]: ISinkConnectorConfig }) {
    for (let key in publishers) {
      if (!publishers.hasOwnProperty(key)) continue;
      let config = publishers[key];
      this.router.addPublisher(key, config);
    }
  }

  private subscribeSources(subscriptions: { [key: string]: ISourceConnectorConfig }) {
    for (let key in subscriptions) {
      if (!subscriptions.hasOwnProperty(key)) continue;
      let config = subscriptions[key];
      this.router.addSubscription(key, config);
      this.router.on(`update_${key}`, result => {
        let geojson: GeoJSON.FeatureCollection<GeoJSON.GeometryObject> = <GeoJSON.FeatureCollection<GeoJSON.GeometryObject>>result;
        if (!geojson || geojson.type !== 'FeatureCollection' || !geojson.features) return;
        geojson.features.forEach(f => {
          // TODO Update WorldState feature list
          this.evaluateRules(f);
        });
      });
    }
  }

  /**
   * Activate a specific rule.
   * @method activateRule
   * @param  {string}     ruleId The Id of the rule
   * @return {void}
   */
  activateRule(ruleId: string) {
    for (let i = 0, length = this.rules.length; i < length; i++) {
      var rule = this.rules[i];
      if (rule.id !== ruleId) continue;
      rule.isActive = true;
      return;
    }
  }

  /**
   * Deactivate a specific rule.
   * @method deactivateRule
   * @param  {string}       ruleId The Id of the rule
   * @return {void}
   */
  deactivateRule(ruleId: string) {
    for (let i = 0, length = this.rules.length; i < length; i++) {
      var rule = this.rules[i];
      if (rule.id !== ruleId) continue;
      rule.isActive = false;
      return;
    }
  }

  private importGeoJSON(key: string, folder: string, fileReference: { path: string, referenceId?: string }) {
    let importFile = path.isAbsolute(fileReference.path) ? fileReference.path : path.join(folder, fileReference.path);
    if (!fs.existsSync(importFile)) return;
    let geojson: GeoJSON.FeatureCollection<GeoJSON.GeometryObject> = require(importFile);
    if (!geojson || !geojson.features || geojson.features.length === 0) return;
    if (this.worldState.hasOwnProperty(key)) {
      logger.error(`Error importing ${importFile}: Key ${key} already exists!`);
      return;
    }
    let importedFeatures: { [key: string]: GeoJSON.Feature<GeoJSON.GeometryObject> } = {};
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
        logger.error(`Error importing feature from ${importFile}: feature has no key (id, name or Name property)! Feature:\n ${JSON.stringify(f, null, 2)}`);
        return;
      }
      if (importedFeatures.hasOwnProperty(key)) {
        logger.error(`Error importing feature from ${importFile}: Key ${key} already exitst! Feature:\n ${JSON.stringify(f, null, 2)}`);
        return;
      } else {
        importedFeatures[key] = f;
      }
    });
    this.worldState.imports[key] = importedFeatures;
  }

  evaluateRules(feature?: GeoJSON.Feature<GeoJSON.GeometryObject>) {
    if (this.isBusy) {
      logger.warn('Added feature ${feature.id} to the queue (#items: $this.featureQueue.length}).');
      this.featureQueue.push(feature);
      return;
    }
    this.isBusy = true;
    // Update the set of applicable rules
    let activeRules = this.rules.filter(r => r.isActive && r.recurrence > 0);
    if (activeRules.length) logger.info(`Starting to evaluate ${activeRules.length} rules:`);
    // Process all rules
    this.worldState.updatedFeature = feature;
    activeRules.forEach(r => r.process(this.worldState, this.service));
    this.isBusy = false;
    if (this.featureQueue.length > 0) {
      this.evaluateRules(this.featureQueue.shift());
    } else {
      //logger.log('Ready evaluating rules...');
    }
  }

}
