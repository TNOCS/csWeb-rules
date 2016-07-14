import {ISourceConnectorConfig} from './connectors/SourceConnector';
import {RestConnector}          from './connectors/RestConnector';
import {EventEmitter}           from 'events';

export class Router extends EventEmitter {
    subscriptions: { [key: string]: ISourceConnectorConfig } = {};

    constructor() {
        super();
    }

    subscribe(subscription: string, config: ISourceConnectorConfig) {
        if (this.subscriptions.hasOwnProperty(subscription)) {
            console.error(`Error: already subscribed to ${subscription}!`);
            return;
        }
        switch (config.type.toLowerCase()) {
            case 'rest':
                let restConnector = new RestConnector(config.host, config.refreshInterval || -1);
                restConnector.connect((result: any) => {
                    this.emit(`update_${subscription}`, result);
                });
                break;
            default:
                console.error(`Error: cannot subscribe to ${subscription}. ${config.type} unknown!`);
                break;
        }
        this.subscriptions[subscription] = config;
    }

}
