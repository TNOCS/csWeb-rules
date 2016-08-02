import {ISourceConnectorConfig} from './connectors/SourceConnector';
import {ISinkConnectorConfig, ISinkConnector}   from './connectors/SinkConnector';
import {RestConnector}          from './connectors/RestConnector';
import {EventEmitter}           from 'events';
import {ImbConnector}           from './connectors/ImbConnector';

export class Router extends EventEmitter {
    private subscriptions: { [key: string]: ISourceConnectorConfig } = {};
    private publications:  { [key: string]: ISinkConnectorConfig } = {};

    public publishers: { [key: string]: ISinkConnector} = {};

    constructor() {
        super();
    }

    addSubscription(subscription: string, config: ISourceConnectorConfig) {
        if (this.subscriptions.hasOwnProperty(subscription)) {
            console.error(`Error: already subscribed to ${subscription}!`);
            return;
        }
        switch (config.type.toLowerCase()) {
            case 'rest':
                let restConnector = new RestConnector(config.host, config.port, config.refreshInterval || -1);
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

    addPublisher(publisher: string, config: ISinkConnectorConfig) {
        if (this.publications.hasOwnProperty(publisher)) {
            console.error(`Error: already publishing to ${publisher}!`);
            return;
        }
        switch (config.type.toLowerCase()) {
            case 'imb':
                let imbConnector = new ImbConnector(config);
                imbConnector.connect();
                this.publishers[publisher] = imbConnector;
                break;
            default:
                console.error(`Error: cannot publish to ${publisher}. ${config.type} unknown!`);
                break;
        }
        this.publications[publisher] = config;
    }

}
