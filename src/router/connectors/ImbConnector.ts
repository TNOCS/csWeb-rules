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

    onNormalEvent: (channel: ImbChannel, payload: Buffer) => void;
    onChangeObject: (action, objectID, shortEventName: string, attributeName: string) => void;
}

export interface ImbConnection {
    connect(host: string, port: number, ownerID: number, ownerName: string, federation: string);
    publish(topic: string, usePrefix: boolean): ImbChannel;
    subscribe(topic: string, usePrefix: boolean): ImbChannel;
    disconnect();
}

export class ImbConnector implements ISinkConnector {
    hasError: boolean;
    errorStatus: string;

    imbConnection: ImbConnection;
    subscriptions: { [key: string]: ImbChannel} = {};
    publishers: { [key: string]: ImbChannel} = {};

    constructor(private config: ISinkConnectorConfig) {}

    /**
     * Connects to the IMB bus.
     *
     * @param {Function} [callback] Optional callback function, invoked when ready.
     */
    connect(cb?: Function) {
        this.imbConnection = new imb.TIMBConnection();
        this.imbConnection.connect(
            this.config.host || 'http://localhost',
            this.config.port || 4000,
            this.config.id || 1,
            this.config.name || 'IMB',
            this.config.hasOwnProperty('federation')
                ? this.config['federation']
                : 'federation');
        if (cb) cb();
    }

    /**
     * Create a channel for publishing.
     *
     * @private
     * @param {string} topic
     * @returns
     */
    private createPublisher(topic: string) {
        if (!this.publishers.hasOwnProperty(topic)) {
            this.publishers[topic] = this.imbConnection.publish(topic, true);
        }
        return this.publishers[topic];
    }

    private createSubscriber(topic: string) {
        if (!this.subscriptions.hasOwnProperty(topic)) {
            this.subscriptions[topic] = this.imbConnection.subscribe(topic, true);
        }
        return this.subscriptions[topic];
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
        let channel = this.createPublisher(topic);
        channel.normalEvent(ImbEventKind.Normal, new Buffer(pl));
    }

    subscribe(topic: string) {
        return this.createSubscriber(topic);
    }

    close() {
        this.imbConnection.disconnect();
    }
}
