import winston = require('winston');
import {IRuleEngineService} from '../../src/engine/RuleEngine';

export class ServiceMock implements IRuleEngineService {
  isRuleActive = true;

  logger = new winston.Logger();
  deactivateRule = () => { return this.isRuleActive = false; }
}