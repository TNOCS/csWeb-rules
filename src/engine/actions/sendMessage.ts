import {WorldState}                     from '../../models/WorldState';
import {IAction, ActionHelper}          from '../../models/Action';
import { Utils }                        from '../../helpers/Utils';
import {RuleEngine, IRuleEngineService} from '../../engine/RuleEngine';

export interface ISendMessageData extends IAction {
  topic: string;
  publisher: string;
}

export function run(service: IRuleEngineService, data: ISendMessageData) {
  if (!data || !data.hasOwnProperty('topic') || !data.hasOwnProperty('publisher')) return null;
  let publisher = service.router.publishers[data['publisher']];
  if (!publisher) return null;
  let topic = data['topic'];
  let action: ISendMessageData = Utils.deepClone(data);
  delete action.topic;
  delete action.publisher;
  return function (worldState: WorldState) {
    if (action.property === '$location' && worldState.activeFeature) {
      action.property = JSON.stringify(worldState.activeFeature.geometry);
    }
    publisher.publish(topic, JSON.stringify(action));
  };
}
