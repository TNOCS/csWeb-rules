export class RuleEngineConfig {
    rulesFolder = 'rules';
    simulationStartTime: Date = new Date();
    simulationRate = 1;

    constructor(config?: RuleEngineConfig) {
        if (!config) return;
        if (config.rulesFolder) this.rulesFolder = config.rulesFolder;
        if (config.simulationRate) this.simulationRate = config.simulationRate;
        if (config.simulationStartTime) this.simulationStartTime = config.simulationStartTime;
    }
}
