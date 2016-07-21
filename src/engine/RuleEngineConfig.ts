export interface IRuleEngineConfig {
    rulesFolder: string;
    simulationStartTime?: Date;
    simulationRate?: number;
}

export class RuleEngineConfig {
    rulesFolder = 'rules';
    simulationStartTime: Date = new Date();
    simulationRate = 1;

    constructor(config?: IRuleEngineConfig) {
        if (!config) return;
        if (config.rulesFolder) this.rulesFolder = config.rulesFolder;
        if (config.simulationRate) this.simulationRate = config.simulationRate;
        if (config.simulationStartTime) this.simulationStartTime = config.simulationStartTime;
    }
}
