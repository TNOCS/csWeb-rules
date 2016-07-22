import {WorldState} from '../models/WorldState';
import {IAction, ActionHelper} from '../models/Action';
import { Utils } from '../helpers/Utils';
import {RuleEngine, IRuleEngineService} from '../engine/RuleEngine';

export interface ISendMessageData {
  topic: string;
  publisher: string;
  message: string;
}

export function run(worldState: WorldState, service: IRuleEngineService, data: Object) {
  if (!data || !data.hasOwnProperty('topic') || !data.hasOwnProperty('publisher')) {
    console.warn('We couldn\'t send a message: ' + JSON.stringify(data, null, 2));
    return;
  }
  let publisher = service.router.publishers[data['publisher']];
  if (!publisher) {
    console.warn('We couldn\'t send a message: ' + JSON.stringify(data, null, 2));
    return;
  }
  let topic = data['topic'];
  let action = Utils.deepClone(data);
  delete action.topic;
  delete action.publisher;
  publisher.publish(topic, JSON.stringify(action));
}
