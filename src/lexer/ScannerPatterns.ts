import {ScanRecognizers} from './Token';

/** A list of keywords and the regex required to parse them. */
export class ScannerPatterns {
    patternMatchers: ScanRecognizers = new ScanRecognizers();
}
