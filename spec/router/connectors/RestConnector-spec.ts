import {RestConnector} from '../../../src/router/connectors/RestConnector';

describe('The REST connector', () => {
    var rest: RestConnector;

    // beforeEach(done => {
    //     rest = new RestConnector()
    // })

    it('should be able to download Google without errors', (done) => {
        rest = new RestConnector('http://www.google.nl', -1);
        rest.connect(done);
        expect(rest.hasError).toBeFalsy;
    });
});
