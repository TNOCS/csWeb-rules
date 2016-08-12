import {Utils} from '../helpers/utils';
import {IProperty} from '../models/Feature';
import {WorldState} from './WorldState';
import {IAction} from '../models/Action';
import {ICondition} from '../models/Condition';
import {RuleEngine, IRuleEngineService} from '../engine/RuleEngine';
import {ISourceConnectorConfig} from '../router/connectors/SourceConnector';
import {ISinkConnectorConfig} from '../router/connectors/SinkConnector';

/**
 * When should the rule be activated.
 *
 * @export
 * @enum {number}
 */
export enum RuleActivationType {
  /**
   * Fire when entering
   */
  OnEnter,
  /**
   * Fire when exeting
   */
  OnExit,
  /**
   * Fire when entering or exiting
   */
  OnChange,
  /**
   * Fire every time the rules are evaluated
   */
  Continuously
}

/** Input file for rules */
export interface IRuleFile {
  /** Key value pair pointing to additional files to load on import */
  imports?: {
    [key: string]: {
      /**
       * Relative path to the file.
       *
       * @type {string}
       */
      path: string,
      /**
       * If supplied, property name that should be used as unique key for the feature.
       *
       * @type {string}
       */
      referenceId?: string
    }
  };
  /** Subscribe to data sources */
  subscribers?: { [key: string]: ISourceConnectorConfig };
  /** List of Publishers to send messages to. */
  publishers?: { [key: string]: ISinkConnectorConfig };
  /** List of rules */
  rules: IRule[];
}

/** Specifies a single rule */
export interface IRule {
  /** Identifier */
  id?: string;
  /**
   * Descriptive text, is not used in the code but only for annotation purposes.
   * @type {string}
   */
  description?: string;
  /**
   * The time the rule is activated.
   * Typically, at start, but some rules may be activated at a later time..
   */
  activatedAt?: Date;
  /** The rule can only be fired when it is active. */
  isActive?: boolean;
  /**
   * If true (default is false), indicates that we are dealing with a generic rule,
   * i.e. not tied to a specific feature.
   * @type {boolean}
   */
  isGenericRule?: boolean;
  /**
   * Determines when the rule should be activated.
   *
   * @type {RuleActivationType}
   */
  activationType: RuleActivationType;
  /** How many times can the rule be fired: -1 is indefinetely, default is once */
  recurrence?: number;
  /** Feature (ID) this rule applies too */
  featureId?: string;
  /**
   * (Set of) condition(s) that need to be fulfilled in order to process the actions.
   * In case the condition is empty, the rule is always fired, on every process.
   */
  conditions?: ICondition[];
  /** Set of actions that will be executed when */
  actions?: IAction[];
  /** Evaluate the rule and execute all actions, is applicable. */
  process?: (worldState: WorldState, service: IRuleEngineService) => void;
}

/**
 * Simple rule, consisting of a condition and an action.
 */
export class Rule implements IRule {
  /** Identifier */
  id: string;
  description: string;
  /**
   * The time the rule is activated.
   * Typically, at start, but some rules may be activated at a later time..
   */
  activatedAt: Date;
  /**
   * Determines when the rule should be activated.
   *
   * @type {RuleActivationType}
   */
  activationType: RuleActivationType;
  isGenericRule: boolean;
  /** The rule can only be fired when it is active. */
  isActive: boolean;
  /** How many times can the rule be fired: -1 is indefinetely, default is once */
  recurrence: number = 1;
  featureId: string;
  /**
   * Feature IDs that have been activated by the rule.
   * We keep track of them as we need to determine whether we should fire the
   * rule onEnter or onExit (in continuous mode, this is not relevant).
   *
   * @type {string[]}
   */
  private activatedFeatureIds: string[];
  /**
   * (Set of) condition(s) that need to be fulfilled in order to process the actions.
   * In case the condition is empty, the rule is always fired, on every process.
   */
  conditions: ICondition[] = [];
  /** Set of actions that will be executed */
  actions: IAction[] = [];

  /** Create a new rule. */
  constructor(rule: IRule, activationTime?: Date) {
    // Don't bother with rules that take no actions.
    if (typeof rule.actions === 'undefined') return;
    if (typeof activationTime === 'undefined') activationTime = new Date();
    this.id = (typeof rule.id === 'undefined')
      ? Utils.newGuid()
      : rule.id;
    // By default, actions are active unless explicitly set.
    this.isActive = (typeof rule.isActive === 'undefined')
      ? true
      : rule.isActive;
    this.isGenericRule = (typeof rule.isGenericRule === 'undefined')
      ? false
      : rule.isGenericRule;
    if (this.isActive && typeof rule.activatedAt === 'undefined') this.activatedAt = activationTime;
    this.activationType = rule.activationType || RuleActivationType.Continuously;
    if (this.activationType !== RuleActivationType.Continuously) {
      this.activatedFeatureIds = [];
    }
    this.recurrence = rule.recurrence || 1;
    this.featureId = rule.featureId;
    this.conditions = rule.conditions;
    this.actions = rule.actions;
  }

  /** Evaluate the rule and execute all actions, if applicable. */
  process(worldState: WorldState, service: IRuleEngineService) {
    // Check if we need to do anything.
    if (!this.isActive || this.recurrence === 0) return;
    if (!worldState.updatedFeature) return;
    // Check if we are dealing with a rule that belongs to a feature, and that feature is being processed.
    if (!this.isGenericRule
      && typeof this.featureId !== 'undefined'
      && worldState.updatedFeature.id !== this.featureId) return;
    // Finally, check the conditions, if any (if none, just go ahead and execute the actions)
    let id = worldState.updatedFeature.id;
    if (typeof this.conditions === 'undefined'
      || this.conditions.length === 0
      || this.evaluateConditions(worldState)) {
      switch (this.activationType) {
        case RuleActivationType.Continuously:
          this.executeActions(worldState, service);
          break;
        case RuleActivationType.OnChange:
        case RuleActivationType.OnEnter:
          if (!this.activatedFeatureIds.some(f => { return f === id; })) {
            this.executeActions(worldState, service);
          }
          this.activatedFeatureIds.push(id);
          break;
        case RuleActivationType.OnExit:
          this.activatedFeatureIds.push(id);
          break;
      }
    } else if (this.activationType === RuleActivationType.OnExit || this.activationType === RuleActivationType.OnChange) {
      let index = this.activatedFeatureIds.indexOf(id);
      if (index >= 0) {
        this.executeActions(worldState, service);
        this.activatedFeatureIds.splice(index, 1);
      }
    }
  }

  /** Evaluate the conditions and check whether all of them are true (AND). */
  private evaluateConditions(worldState: WorldState) {
    let passed = true;
    this.conditions.some(c => {
      if (c.evaluate(worldState)) return false;
      passed = false;
      return true;
    });
    return passed;
  }

  // /** Evaluate the conditions and check whether all of them are true (AND). */
  // private evaluateConditions(worldState: WorldState) {
  // if (typeof worldState.activeFeatures === 'undefined') return false;
  // for (let i = 0; i < this.conditions.length; i++) {
  //     var c = this.conditions[i];
  //     var check = c[0];
  //     if (typeof check === 'string') {
  //         var length = c.length;
  //         var prop: string | number | boolean;
  //         switch (check.toLowerCase()) {
  //             case 'propertyexists':
  //                 if (length !== 2) return this.showWarning(c);
  //                 prop = c[1];
  //                 if (typeof prop === 'string') {
  //                     if (!worldState.activeFeatures.properties.hasOwnProperty(prop)) return false;
  //                     service.logger.log(`Property ${prop} exists.`);
  //                 }
  //                 break;
  //             case 'propertyisset':
  //                 if (length < 2) return this.showWarning(c);
  //                 prop = c[1];
  //                 if (typeof prop === 'string') {
  //                     if (!worldState.activeFeatures.properties.hasOwnProperty(prop)) return false;
  //                     let propValue = worldState.activeFeatures.properties[prop];
  //                     if (length === 2 && propValue === null) return false;
  //                     if (length === 3 && propValue !== c[2]) return false;
  //                     service.logger.log(`Property ${prop} is set` + (length === 2 ? '.' : ' ' + c[2]));
  //                 }
  //                 break;
  //             case 'propertygreaterorequalthan':
  //                 if (length !== 3) return this.showWarning(c);
  //                 prop = c[1];
  //                 if (typeof prop === 'string') {
  //                     if (!worldState.activeFeatures.properties.hasOwnProperty(prop)) return false;
  //                     let propValue = worldState.activeFeatures.properties[prop];
  //                     if (propValue < c[2]) return false;
  //                     service.logger.log(`Property ${prop} is greater than ${c[2]}.`);
  //                 }
  //                 break;
  //             case 'propertygreaterthan':
  //                 if (length !== 3) return this.showWarning(c);
  //                 prop = c[1];
  //                 if (typeof prop === 'string') {
  //                     if (!worldState.activeFeatures.properties.hasOwnProperty(prop)) return false;
  //                     let propValue = worldState.activeFeatures.properties[prop];
  //                     if (propValue <= c[2]) return false;
  //                     service.logger.log(`Property ${prop} is greater than ${c[2]}.`);
  //                 }
  //                 break;
  //             case 'propertyequals':
  //                 if (length !== 3) return this.showWarning(c);
  //                 prop = c[1];
  //                 if (typeof prop === 'string') {
  //                     if (!worldState.activeFeatures.properties.hasOwnProperty(prop)) return false;
  //                     let propValue = worldState.activeFeatures.properties[prop];
  //                     if (propValue !== c[2]) return false;
  //                     service.logger.log(`Property ${prop} equals ${c[2]}.`);
  //                 }
  //                 break;
  //             case 'propertydoesnotequal':
  //             case 'propertynotequal':
  //                 if (length !== 3) return this.showWarning(c);
  //                 prop = c[1];
  //                 if (typeof prop === 'string') {
  //                     if (!worldState.activeFeatures.properties.hasOwnProperty(prop)) return false;
  //                     let propValue = worldState.activeFeatures.properties[prop];
  //                     if (propValue === c[2]) return false;
  //                     service.logger.log(`Property ${prop} does not equal ${c[2]}.`);
  //                 }
  //                 break;
  //             case 'propertylessthan':
  //                 if (length !== 3) return this.showWarning(c);
  //                 prop = c[1];
  //                 if (typeof prop === 'string') {
  //                     if (!worldState.activeFeatures.properties.hasOwnProperty(prop)) return false;
  //                     let propValue = worldState.activeFeatures.properties[prop];
  //                     if (propValue >= c[2]) return false;
  //                     service.logger.log(`Property ${prop} is less than ${c[2]}.`);
  //                 }
  //                 break;
  //             case 'propertylessorequalthan':
  //                 if (length !== 3) return this.showWarning(c);
  //                 prop = c[1];
  //                 if (typeof prop === 'string') {
  //                     if (!worldState.activeFeatures.properties.hasOwnProperty(prop)) return false;
  //                     let propValue = worldState.activeFeatures.properties[prop];
  //                     if (propValue > c[2]) return false;
  //                     service.logger.log(`Property ${prop} is less or equal than ${c[2]}.`);
  //                 }
  //                 break;
  //             case 'propertycontains':
  //                 if (length !== 3) return this.showWarning(c);
  //                 prop = c[1];
  //                 if (typeof prop === 'string') {
  //                     if (!worldState.activeFeatures.properties.hasOwnProperty(prop)) return false;
  //                     let props: any[] = worldState.activeFeatures.properties[prop];
  //                     if (props instanceof Array && props.indexOf(c[2]) < 0) return false;
  //                     service.logger.log(`Property ${prop} contains ${c[2]}.`);
  //                 }
  //                 break;
  //             default:
  //                 return false;
  //         }
  //     } else {
  //         // First item is not a key/string
  //         return false;
  //     }
  // }
  //     return true;
  // }

  // private showWarning(condition: [string | number | boolean]) {
  //   service.logger.warn(`Rule ${this.id} contains an invalid condition (ignored): ${condition}!`);
  //   return false;
  // }

  private executeActions(worldState: WorldState, service: IRuleEngineService) {
    service.logger.info(`Executing ${this.actions.length} action${this.actions.length > 1 ? 's' : ''}:`);
    for (let i = 0; i < this.actions.length; i++) {
      var a = this.actions[i];
      service.logger.info(`Executing action for active feature ${worldState.updatedFeature.id}: ` + JSON.stringify(a, null, 2));
      a.run(worldState);
      // var method = a.method;
      // var key: string | number | boolean;
      // if (typeof method === 'string') {
      // switch (action.toLowerCase()) {
      //     case 'sendmessage':
      //         if (!a.property || !a.property.hasOwnProperty('topic') || !a.property.hasOwnProperty('msg') || !a.property.hasOwnProperty('publisher')) {
      //             service.logger.warn('We couldn\'t send a message: ' + JSON.stringify(a, null, 2));
      //             break;
      //         }
      //         let publisher = service.router.publishers[a.property['publisher']];
      //         if (!publisher) {
      //             service.logger.warn('We couldn\'t send a message: ' + JSON.stringify(a, null, 2));
      //             break;
      //         }
      //         let topic = a.property['topic'];
      //         let msg = a.property['msg'];
      //         publisher.publish(topic, typeof msg === `string` ? msg : JSON.stringify(msg));
      //         break;
      //     case 'add':
      //         // add feature
      //         var id = service.timer.setTimeout(function(f, fid, service) {
      //             return () => {
      //                 var feature = f;
      //                 if (length > 1) {
      //                     var featureId = <string>a[1];
      //                     worldState.features.some(feat => {
      //                         if (feat && feat.id !== fid) return false;
      //                         feature = feat;
      //                         return true;
      //                     });
      //                 }
      //                 service.logger.log('Add feature ' + feature.id);
      //                 if (!feature.properties.hasOwnProperty('date')) feature.properties['date'] = new Date();
      //                 if (!feature.properties.hasOwnProperty('roles')) feature.properties['roles'] = ['rti'];
      //                 service.addFeature(feature);
      //             };
      //         } (this.feature, length > 1 ? <string>a[1] : '', service), this.getDelay(a));
      //         service.logger.log(`Timer ${id}: Add feature ${this.isGenericRule ? a[1] : this.feature.id}`);
      //         break;
      //     case 'answer':
      //     case 'set':
      //         // Anwer, property, value [, delay], as set, but also sets answered to true and removes the action tag.
      //         // Set, property, value [, delay] sets value and updated.
      //         if (length < 3) {
      //             service.logger.warn(`Rule ${this.id} contains an invalid action (ignored): ${a}!`);
      //             return;
      //         }
      //         if (typeof key === 'string') {
      //             this.setTimerForProperty(service, key, a[2], this.getDelay(a), action === 'answer');
      //         }
      //         break;
      //     case 'push':
      //         // push property value [, delay]
      //         if (length < 3) {
      //             service.logger.warn(`Rule ${this.id} contains an invalid action (ignored): ${a}!`);
      //             return;
      //         }
      //         var key2 = a[1];
      //         if (typeof key2 === 'string') {
      //             var valp = a[2];
      //             var id = service.timer.setTimeout(function(f, k, v, service, updateProperty) {
      //                 return () => {
      //                     service.logger.log(`Feature ${f.id}. Pushing ${k}: ${v}`);
      //                     if (!f.properties.hasOwnProperty(k)) {
      //                         f.properties[k] = [v];
      //                     } else {
      //                         f.properties[k].push(v);
      //                     }
      //                     updateProperty(f, service, k, f.properties[k]);
      //                 };
      //             } (this.feature, key2, valp, service, this.updateProperty), this.getDelay(a));
      //             service.logger.log(`Timer ${id}: push ${key2}: ${valp}`);
      //         }
      //         break;
      // }
      // } else {
      //     service.logger.warn(`Rule ${this.id} contains an invalid action (ignored): ${a}!`);
      //}
    }
    if (this.recurrence > 0) this.recurrence--;
    if (this.recurrence === 0) service.deactivateRule(this.id);
  }

  // private setTimerForProperty(service: IRuleEngineService, key: string, value: any, delay = 0, isAnswer = false) {
  //   var id = service.timer.setTimeout(function (f, k, v, service, updateProperty) {
  //     return () => {
  //       service.logger.log(`Feature ${f.id}: ${k} = ${v}`);
  //       f.properties[k] = v;
  //       updateProperty(f, service, k, f.properties[key], isAnswer);
  //     };
  //   } (this.feature, key, value, service, this.updateProperty), delay);
  //   service.logger.info(`Timer ${id}: ${key} = ${value}`);
  // }

  // private static updateLog(f: IFeature, logs: { [prop: string]: IPropertyUpdate[] }, key: string, now: number, value: string | number | boolean) {
  // if (!f.logs.hasOwnProperty(key)) f.logs[key] = [];
  // var log: DynamicLayer.IPropertyUpdate = {
  //     'prop': key,
  //     'ts': now,
  //     'value': value
  // };
  // f.logs[key].push(log);
  // if (logs) logs[key] = f.logs[key];
  // }

  private updateProperty(f: GeoJSON.Feature<GeoJSON.GeometryObject>, service: IRuleEngineService, key: string, value: any, isAnswer = false) {
    // var now = service.timer.now();
    // if (!f.hasOwnProperty('logs')) f.logs = {};
    // var logs: { [prop: string]: DynamicLayer.IPropertyUpdate[] } = {};
    // Rule.updateLog(f, logs, key, now, value);
    // Rule.updateLog(f, null, 'updated', now, now);

    // if (isAnswer) {
    //     Rule.updateLog(f, logs, 'answered', now, true);

    //     key = 'tags';
    //     if (f.properties.hasOwnProperty(key)) {
    //         let index = f.properties[key].indexOf('action');
    //         if (index >= 0) {
    //             f.properties[key].splice(index, 1);
    //             Rule.updateLog(f, logs, key, now, f.properties[key]);
    //         }
    //     }
    // }
    // service.logger.log('Log message: ');
    // service.updateLog(f.id, logs);
    // service.updateFeature(f);
  }

  /** Get the delay, if present, otherwise return 0 */
  private getDelay(action: IAction) {
    return action.delay
      ? +action.delay * 1000
      : 0;
  }
}
