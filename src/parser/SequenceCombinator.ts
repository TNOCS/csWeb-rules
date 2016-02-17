import {Combinator}       from './Combinator';
import {CombinatorResult} from './CombinatorResult';

export class SequenceCombinator extends Combinator {
    protected productions: Combinator[];

    constructor(...productions: Combinator[]) {
        super();
        this.productions = productions;
    }

    recognizer(inbound: CombinatorResult) {
        if (!inbound.matchSuccess()) {
            return inbound;
        }
        var latestResult = inbound,
            productionIndex = 0;

        while (latestResult.matchSuccess() && productionIndex < this.productions.length) {
            let p = this.productions[productionIndex++];
            latestResult = p.recognizer(latestResult);
            // Use the match results?
        }

        if (latestResult.matchSuccess()) {
            this.action();
        } else {
            latestResult = new CombinatorResult(inbound.getTokenBuffer(), false);
        }
        return latestResult;
    }

    action() {}
}

/** 
 * Optional sequence, always returns true, but on a successfull match, the action is executed.
 * NOTE: This is almost a copy of the SequenceCombinator, except that the CombinatorResult's matchSuccess is always true.
 */
export class OptionalSequenceCombinator extends Combinator {
    protected productions: Combinator[];

    constructor(...productions: Combinator[]) {
        super();
        this.productions = productions;
    }

    recognizer(inbound: CombinatorResult) {
        if (!inbound.matchSuccess()) {
            return inbound;
        }
        var latestResult = inbound,
            productionIndex = 0;

        while (latestResult.matchSuccess() && productionIndex < this.productions.length) {
            let p = this.productions[productionIndex++];
            latestResult = p.recognizer(latestResult);
            // Use the match results?
        }

        if (latestResult.matchSuccess()) {
            this.action();
        } else {
            latestResult = new CombinatorResult(inbound.getTokenBuffer(), true);
        }
        return latestResult;
    }

    action() {}
}
