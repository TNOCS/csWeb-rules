import {CombinatorResult} from './CombinatorResult';
import {RuleDescription}  from './CombinatorResult';

export interface ICombinatorAction {
    (matches: string[][], ruleDesc: RuleDescription): void;
}

export abstract class Combinator {
    protected action: ICombinatorAction;
    protected productions: Combinator[];

    // constructor(protected action: ICombinatorAction, ...productions: Combinator[]) {
    //     this.productions = productions;
    // }

    abstract recognizer(inbound: CombinatorResult): CombinatorResult;
}
