import {WorldState}                     from '../../models/WorldState';
import {IAction, ActionHelper}          from '../../models/Action';
import {Utils}                          from '../../helpers/Utils';
import {RuleEngine, IRuleEngineService} from '../../engine/RuleEngine';

export interface ISendImbMessageData extends IAction {
  topic: string;
  publisher: string;
  // TODO to?: string;
}

export function run(service: IRuleEngineService, data: ISendImbMessageData) {
  if (!data || !data.hasOwnProperty('topic') || !data.hasOwnProperty('publisher')) return null;
  let publisher = service.router.publishers[data['publisher']];
  if (!publisher) return null;
  let topic = data['topic'];
  let action: ISendImbMessageData = Utils.deepClone(data);
  delete action.topic;
  delete action.publisher;
  return function (worldState: WorldState, activatedFeatures: GeoJSON.Feature<GeoJSON.GeometryObject>[]) {
    if (!activatedFeatures) return;
    activatedFeatures.forEach(f => {
      if (action.property === '$location') {
        action.property = JSON.stringify(f.geometry);
      }
      publisher.publish(topic, JSON.stringify(action));
    });
  };
}
