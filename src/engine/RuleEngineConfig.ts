export class RuleEngineConfig {
    rulesFolder = 'rules';

    constructor(config?: RuleEngineConfig) {
        if (!config) return;
        if (config.rulesFolder) this.rulesFolder = config.rulesFolder;
    }
}
