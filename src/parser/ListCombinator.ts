import {Combinator}        from './Combinator';
import {ICombinatorAction} from './Combinator';
import {CombinatorResult}  from './CombinatorResult';

/**
 * The ListCombinator matches a list of the same tokens (zero or more times, i.e. (ab)*).
 */
export class ListCombinator extends Combinator {
    /**
     * Constructor
     * @param  {ICombinatorAction} action
     * @param  {Combinator[]} ...productions
     */
    constructor(action: ICombinatorAction, ...productions: Combinator[]) {
        super();
        this.action = action;
        this.productions = productions;
    }

    recognizer(inbound: CombinatorResult) {
        if (!inbound.matchSuccess()) return inbound;
        var latestResult                  = inbound,
            resultIndex                   = 0,
            productionIndex: number,
            matches: string[][]           = [];

        while (latestResult.matchSuccess() && latestResult.hasNextToken) {
            productionIndex = 0;
            while (latestResult.matchSuccess() && productionIndex < this.productions.length) {
                let p = this.productions[productionIndex++];
                latestResult = p.recognizer(latestResult);
                if (latestResult.matchSuccess()) matches[resultIndex++] = latestResult.getMatchValue();
            }
        }

        if (resultIndex > 0 && this.action) this.action(matches, latestResult);
        return new CombinatorResult(latestResult.getTokenBuffer(), true, latestResult.result);
    }
}
