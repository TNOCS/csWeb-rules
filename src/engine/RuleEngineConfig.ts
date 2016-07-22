import fs = require('fs');
import path = require('path');

export interface IRuleEngineConfig {
  rulesFolder: string;
  simulationStartTime?: Date;
  simulationRate?: number;
  actionsFolder?: string;
  conditionsFolder?: string;
}

export class RuleEngineConfig implements IRuleEngineConfig {
  rulesFolder: string;
  actionsFolder: string;
  conditionsFolder: string;

  simulationStartTime: Date = new Date();
  simulationRate = 1;

  constructor(config?: IRuleEngineConfig) {
    const defaultRulesFolder = 'rules';
    const defaultActionsFolder = 'actions';
    const defaultConditionsFolder = 'conditions';

    this.rulesFolder = this.createFolderPath(defaultRulesFolder, config && config.rulesFolder);
    this.actionsFolder = this.createFolderPath(defaultActionsFolder, config && config.actionsFolder);
    this.conditionsFolder = this.createFolderPath(defaultConditionsFolder, config && config.conditionsFolder);

    if (!config) return;
    if (config.rulesFolder) this.rulesFolder = config.rulesFolder;
    if (config.simulationRate) this.simulationRate = config.simulationRate;
    if (config.simulationStartTime) this.simulationStartTime = config.simulationStartTime;
  }

  private createFolderPath(defaultFolder: string, configFolder?: string) {
    let folder: string;
    if (configFolder) {
      folder = path.isAbsolute(configFolder)
      ? configFolder
      : path.join(process.cwd(), configFolder);
    } else {
      folder = path.join(__dirname, defaultFolder);
    }
    if (!fs.existsSync(folder)) throw new Error(`Folder ${folder} does not exist!`);
    return folder;
  }
}
