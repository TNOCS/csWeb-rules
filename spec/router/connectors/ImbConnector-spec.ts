import {ImbConnector} from '../../../src/router/connectors/ImbConnector';
import {ISinkConnectorConfig} from '../../../src/router/connectors/SinkConnector';

describe('The IMB connector', () => {
    var imb: ImbConnector;
    var testConnectionSettings: ISinkConnectorConfig;

    beforeEach(() => {
        testConnectionSettings = {
            id: 1234,
            type: 'IMB',
            host: 'imb.lohman-solutions.com',
            port: 4000,
            name: 'Test',
            federation: 'TNOdemo'
        };
        imb = new ImbConnector(testConnectionSettings);
    });

    afterEach(() => {
        imb.close();
    });

    xit('should be able to connect to a bus', done => {
        imb.connect(done);
        expect(imb.hasError).toBeFalsy;
    });

    xit('should be able to publish a message', () => {
        imb.connect();
        let topic = 'testing_rule_engine';
        imb.publish(topic, 'this is my 1st test');
        expect(imb.hasError).toBeFalsy;
        expect(imb.publishers.hasOwnProperty(topic)).toBeTruthy;
    });

    // fit("takes a long time", function(done) {
    //   setTimeout(function() {
    //     done();
    //   }, 2000);
    // });

    xit('should be able to receive a published message', done => {
        imb.connect();
        testConnectionSettings.id = 3456;
        testConnectionSettings.name = 'subscriber';
        let imb2 = new ImbConnector(testConnectionSettings);
        imb2.connect();
        let topic = 'testing_rule_engine2';
        let msg = 'this is my 2nd test';
        let channel = imb2.subscribe(topic);
        channel.onNormalEvent = (c, payload) => {
            expect(payload).toContain(msg);
            done();
        };
        setTimeout(() => {
            imb.publish(topic, msg)
            expect(imb.hasError).toBeFalsy;
            expect(imb.publishers.hasOwnProperty(topic)).toBeTruthy;
        }, 100);
    });
});
