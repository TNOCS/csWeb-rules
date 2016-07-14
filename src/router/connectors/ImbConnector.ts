import fs = require('fs');
import {ISinkConnectorConfig, ISinkConnector} from './SinkConnector';
var imb = require('./imb');

export enum ImbEventKind {
    ChangeObject = 0,
    StreamHeader = 1,
    StreamBody = 2,
    StreamTail = 3,
    Normal = 5,
    ChangeObjectData = 6
}

export interface ImbChannel {
    changeObject(action, objectID, attribute);
    normalEvent(eventKind: ImbEventKind, payload: Buffer);
    stream(streamName: string, stream: fs.ReadStream);

    onNormalEvent(channel: ImbChannel, payload: Buffer);
    onChangeObject(action, objectID, shortEventName: string, attributeName: string);
}

export interface ImbConnection {
    connect(host: string, port: number, ownerID: number, ownerName: string, federation: string);
    publish(topic: string, usePrefix: boolean): ImbChannel;
    subscribe(topic: string, usePrefix: boolean): ImbChannel;
}

export class ImbConnector implements ISinkConnector {
    hasError: boolean;
    errorStatus: string;

    imbConnection: ImbConnection;
    subscriptions: { [key: string]: ImbChannel} = {};
    publishers: { [key: string]: ImbChannel} = {};

    constructor(private config: ISinkConnectorConfig) {}

    connect() {
        this.imbConnection = new imb.TIMBConnection();
        this.imbConnection.connect(
            this.config.host || 'http://localhost',
            this.config.port || 4000,
            this.config.id || 1,
            this.config.name || 'IMB',
            this.config.hasOwnProperty('federation')
                ? this.config['federation']
                : 'federation');
    }

    private createChannel(topic: string) {
        if (this.publishers.hasOwnProperty(topic)) return;
        this.publishers[topic] = this.imbConnection.publish(topic, true);
    }

    /**
     * Publish a payload message.
     *
     * @param {string} topic
     * @param {string | Object} payload
     */
    publish(topic: string, payload: string | Object) {
        let pl: string = typeof payload === 'string'
            ? payload
            : JSON.stringify(payload);
        if (typeof payload === 'string') pl = payload;
        if (!this.publishers.hasOwnProperty(topic)) this.createChannel(topic);
        let channel = this.publishers[topic];
        channel.normalEvent(ImbEventKind.Normal, new Buffer(pl));
    }
}
