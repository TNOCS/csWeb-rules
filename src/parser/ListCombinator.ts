import {Combinator}        from './Combinator';
import {ICombinatorAction} from './Combinator';
import {CombinatorResult}  from './CombinatorResult';

/**
 * The abstractListCombinator matches a list of the same tokens (one|zero or more times, i.e. (ab)+ or (ab)*).
 */
export abstract class AbstractListCombinator extends Combinator {
    /**
     * Constructor
     * @param  {ICombinatorAction} action
     * @param  {Combinator[]} ...productions
     */
    constructor(private atLeastOneMatch: boolean, action: ICombinatorAction, ...productions: Combinator[]) {
        super();
        this.action = action;
        this.productions = productions;
    }

    recognizer(inbound: CombinatorResult) {
        if (!inbound.matchSuccess) return inbound;
        var latestResult        = inbound,
            resultIndex         = 0,
            matches: string[][] = [],
            productionIndex: number;

        while (latestResult.matchSuccess && latestResult.hasNextToken) {
            productionIndex = 0;
            while (latestResult.matchSuccess && productionIndex < this.productions.length) {
                let p = this.productions[productionIndex++];
                latestResult = p.recognizer(latestResult);
                if (!latestResult.matchSuccess) continue;
                let matchValue = latestResult.getMatchValue();
                if (matchValue.length > 0) matches[resultIndex++] = matchValue;
            }
        }

        let isSuccess = resultIndex > 0;
        if (isSuccess && this.action) this.action(matches, latestResult.ruleDesc);
        return new CombinatorResult(latestResult.getTokenBuffer(), this.atLeastOneMatch ? isSuccess : true, latestResult.ruleDesc);
    }
}

/**
 * The ZeroOrMore combinator matches a list of the same tokens (zero or more times, i.e. (ab)*).
 */
export class ZeroOrMore extends AbstractListCombinator {
    constructor(action: ICombinatorAction, ...productions: Combinator[]) {
        super(false, action, ...productions);
    }
}

/**
 * The OneOrMore combinator matches a list of the same tokens (one or more times, i.e. (ab)+).
 */
export class OneOrMore extends AbstractListCombinator {
    constructor(action: ICombinatorAction, ...productions: Combinator[]) {
        super(true, action, ...productions);
    }
}
