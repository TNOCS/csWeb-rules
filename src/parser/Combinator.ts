import * as cr from './CombinatorResult';

export abstract class Combinator {
    abstract recognizer(inbound: cr.CombinatorResult): cr.CombinatorResult;
    abstract action(matchValue: string[]): void;
}
