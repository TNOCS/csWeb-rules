import {Combinator}       from './Combinator';
import {CombinatorResult} from './CombinatorResult';

/**
 * The ListCombinator matches a list of the same tokens (zero or more times, i.e. matchedToken*).
 */
export class ListCombinator extends Combinator {
    constructor(private production: Combinator) {
        super();
    }

    recognizer(inbound: CombinatorResult) {
        if (!inbound.matchSuccess()) {
            return inbound;
        }
        var latestResult = inbound,
            results: string[] = [];

        while (latestResult.matchSuccess()) {
            latestResult = this.production.recognizer(latestResult);
            if (latestResult.matchSuccess()) {
                latestResult.getMatchValue().forEach(m => results.push(m));
            }
        }

        if (results.length > 0) {
            this.action(results);
            latestResult = new CombinatorResult(latestResult.getTokenBuffer(), true, results);
        }
        return latestResult;
    }

    action(results: string[]) {}
}
