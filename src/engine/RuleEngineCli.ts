import fs = require('fs');
import path = require('path');
import { RuleEngine } from './RuleEngine';
import { RuleEngineConfig } from './RuleEngineConfig';

const commandLineArgs = require('command-line-args');

export interface ICommandLineOptions {
    ruleConfig: string;
    rulesFolder: string;
}

export class CommandLineInterface {
    static optionDefinitions = [
        { name: 'rulesFolder', alias: 'f', type: String, multiple: false, typeLabel: '[underline]{Rule folder}', description: 'Path to the rule files.' },
        { name: 'ruleConfig', alias: 'r', type: String, defaultOption: true, typeLabel: '[underline]{Configuration file}', description: 'Rule configuration file (default).' }
    ];

    static sections = [{
        header: 'Rule Engine',
        content: 'Run the rule Rule Engine.'
    }, {
            header: 'Options',
            optionList: CommandLineInterface.optionDefinitions
        }
    ];
}

const options: ICommandLineOptions = commandLineArgs(CommandLineInterface.optionDefinitions);

let ruleEngineConfig: RuleEngineConfig;
if (options.rulesFolder) {
    ruleEngineConfig = new RuleEngineConfig({
        rulesFolder: options.rulesFolder
    });
} else if (options.ruleConfig) {
    if (!path.isAbsolute(options.ruleConfig)) options.ruleConfig = path.join(process.cwd(), options.ruleConfig);
    if (fs.existsSync(options.ruleConfig)) {
        ruleEngineConfig = new RuleEngineConfig(require(options.ruleConfig));
    }
}
if (!ruleEngineConfig) {
    const getUsage = require('command-line-usage');
    const usage = getUsage(CommandLineInterface.sections);
    console.error('Cannot start the rule engine. Missing configuration file!');
    console.log(usage);
    process.exit(1);
}

const ruleEngine = new RuleEngine(() => {
    console.log('Rule engine loaded...');
}, ruleEngineConfig);
