import {Combinator}        from './Combinator';
import {ICombinatorAction} from './Combinator';
import {CombinatorResult}  from './CombinatorResult';

/**
 * Abstract sequence combinator, serves as the basis for the Sequence combinator and ZeroOrOne (a.k.a. OptionalSequenceCombinator) combinator.
 */
export abstract class AbstractSequenceCombinator extends Combinator {
    /**
     * Constructor
     * @param  {ICombinatorAction} action
     * @param  {Combinator[]} ...productions
     */
    constructor(private isOptional: boolean, action: ICombinatorAction, ...productions: Combinator[]) {
        super();
        this.action = action;
        this.productions = productions;
    }

    /**
     * Recognizer: recognize token sequence.
     * @param  {CombinatorResult} inbound
     */
    recognizer(inbound: CombinatorResult) {
        if (!inbound.matchSuccess) return inbound;
        var latestResult                  = inbound,
            productionIndex               = 0,
            resultIndex                   = 0,
            matches: string[][]           = [];

        while (latestResult.matchSuccess && productionIndex < this.productions.length) {
            let p = this.productions[productionIndex++];
            latestResult = p.recognizer(latestResult);
            let matchValue = latestResult.getMatchValue();
            if (matchValue.length > 0) matches[resultIndex++] = matchValue;
        }

        if (latestResult.matchSuccess && this.action) {
            this.action(matches, latestResult.ruleDesc);
        } else {
            latestResult = new CombinatorResult(inbound.getTokenBuffer(), this.isOptional, latestResult.ruleDesc);
        }
        return latestResult;
    }
}

export class Sequence extends AbstractSequenceCombinator {
    constructor(action: ICombinatorAction, ...productions: Combinator[]) {
        super(false, action, ...productions);
    }
}

/** 
 * Optional sequence, always returns true, but on a successfull match, the action is executed (ab)?.
 */
export class ZeroOrOne extends AbstractSequenceCombinator {
    constructor(action: ICombinatorAction, ...productions: Combinator[]) {
        super(true, action, ...productions);
    }
}
