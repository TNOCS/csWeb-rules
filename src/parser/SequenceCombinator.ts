import {Combinator}        from './Combinator';
import {ICombinatorAction} from './Combinator';
import {CombinatorResult}  from './CombinatorResult';

export class SequenceCombinator extends Combinator {
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

    /**
     * Recognizer: recognize token sequence.
     * @param  {CombinatorResult} inbound
     */
    recognizer(inbound: CombinatorResult) {
        if (!inbound.matchSuccess()) return inbound;
        var latestResult                  = inbound,
            productionIndex               = 0,
            matches: string[][]           = [];

        while (latestResult.matchSuccess() && productionIndex < this.productions.length) {
            let p = this.productions[productionIndex];
            latestResult = p.recognizer(latestResult);
            matches[productionIndex] = latestResult.getMatchValue();
            productionIndex++;
        }

        if (latestResult.matchSuccess()) {
            this.action(matches, latestResult);
        } else {
            latestResult = new CombinatorResult(inbound.getTokenBuffer(), false);
        }
        return latestResult;
    }
}

/** 
 * Optional sequence, always returns true, but on a successfull match, the action is executed.
 * NOTE: This is almost a copy of the SequenceCombinator, except that the CombinatorResult's matchSuccess is always true.
 */
export class OptionalSequenceCombinator extends Combinator {
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

    /**
     * Recognizer: recognize token sequence.
     * @param  {CombinatorResult} inbound
     */
    recognizer(inbound: CombinatorResult) {
        if (!inbound.matchSuccess()) return inbound;
        var latestResult                  = inbound,
            productionIndex               = 0,
            matches: string[][]           = [];

        while (latestResult.matchSuccess() && productionIndex < this.productions.length) {
            let p = this.productions[productionIndex];
            latestResult = p.recognizer(latestResult);
            matches[productionIndex] = latestResult.getMatchValue();
            productionIndex++;
        }

        if (latestResult.matchSuccess()) {
            this.action(matches, latestResult);
        } else {
            latestResult = new CombinatorResult(inbound.getTokenBuffer(), true);
        }
        return latestResult;
    }
}
