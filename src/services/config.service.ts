import { ConfigData } from "../models/data.model";
import { LogServiceInterface } from "./log.service";

export enum ConfigModes {
    CMD = "cmd",
    REST = "rest"
}

export enum ConfigApiNames {
    TEST = "test",
    GOOGLE = "google"
}

export enum ConfigDirectionNames {
    ONE_WAY = "one-way",
    TWO_WAY = "two-way",
}

export enum CmdInputFileTypes {
    XLSX = "xlsx",
    JSON = "json"
}

export class ConfigService {
    static _instance: ConfigService;
    _config: ConfigData = { mode: null, apiName: null, apiKey: null, direction: null, cmdInputFileType: null };
    _logServices: LogServiceInterface[] = [];

    private constructor(logServices: LogServiceInterface[] = null) {
        this._logServices = logServices;
    }

    static get Instance() {
        return this._instance || (this._instance = new this());
    }

    logError(error: string) {
        for (const logService of this._logServices) {
            logService.errorLog(error);
        }
    }

    validateConfigFile(configFile: any): void {
        // check config file keys
        let configFileKeyList: string[] = ["mode", "api", "direction"];
        for (const configFileKey of configFileKeyList) {
            if (configFile[configFileKey] === undefined || configFile[configFileKey] === null)
                throw `Config file doesn't have "${configFileKey}" key!`;
        }

        // check config file mode's type
        let configFileMode = configFile.mode;
        if (Object.prototype.toString.call(configFileMode) !== '[object String]')
            throw `Config file "mode" parameter's type is not string!`;
        // check config file mode's values
        let modeValueList: string[] = [ConfigModes.CMD, ConfigModes.REST];
        if (modeValueList.indexOf(configFileMode) === -1)
            throw `Config file "mode" parameter has wrong value! It can be ${[...modeValueList]}`;

        // check config file api keys
        let configFileApi = configFile.api;
        let configApiKeyList: string[] = ["name", "key"]
        for (const configApiKey of configApiKeyList) {
            if (configFileApi[configApiKey] === undefined || configFileApi[configApiKey] === null)
                throw `API config parameter doesn't have "${configApiKey}" key!`;

            if (Object.prototype.toString.call(configFileApi[configApiKey]) !== '[object String]')
                throw `Config file API "${configApiKey}" parameter's type is not string!`;
        }
        // check config api name's values
        let configApiNameValueList: string[] = [ConfigApiNames.TEST, ConfigApiNames.GOOGLE]
        if (configApiNameValueList.indexOf(configFileApi.name) === -1)
            throw `Config file "API name" parameter has wrong value! It can be ${[...configApiNameValueList]}`;

        // check config direction's values
        let configFileDirection = configFile.direction;
        let configDirectionValueList: string[] = [ConfigDirectionNames.ONE_WAY, ConfigDirectionNames.TWO_WAY];
        if (configDirectionValueList.indexOf(configFileDirection) === -1)
            throw `Config file "direction" parameter has wrong value! It can be ${[...configDirectionValueList]}`;


        // check config file CMD input type
        if (configFileMode == ConfigModes.CMD) {
            if (configFile["cmdInputFileType"] === undefined || configFile["cmdInputFileType"] === null)
                throw `Config file doesn't have "cmdInputType" key!`;

            // check config file CMD input type's value
            let configFileCmdInputFileType = configFile.cmdInputFileType;
            let cmdInputFileTypeValueList: string[] = [CmdInputFileTypes.XLSX, CmdInputFileTypes.JSON];
            if (cmdInputFileTypeValueList.indexOf(configFileCmdInputFileType) === -1)
                throw `Config file "CMD input type" parameter has wrong value! It can be ${[...cmdInputFileTypeValueList]}`;
        }
    }

    readConfigFile(configFile: any): void {
        this.validateConfigFile(configFile);
        this.setConfigMode(configFile.mode);
        this.setConfigApiName(configFile.api.name);
        this.setConfigApiKey(configFile.api.key);
        this.setConfigDirection(configFile.direction);
        this.setCmdInputFileType(configFile.cmdInputFileType);
    }

    setConfigMode(mode: string): void {
        this._config.mode = mode;
    }

    getConfigMode(): string {
        return this._config.mode;
    }

    setConfigApiName(name: string): void {
        this._config.apiName = name;
    }

    getConfigApiName(): string {
        return this._config.apiName;
    }

    setConfigApiKey(name: string): void {
        this._config.apiKey = name;
    }

    getConfigApiKey(): string {
        return this._config.apiKey;
    }

    setConfigDirection(direction: string): void {
        this._config.direction = direction;
    }

    getConfigDirection(): string {
        return this._config.direction;
    }

    setCmdInputFileType(type: string) {
        if (this.getConfigMode() == ConfigModes.CMD)
            this._config.cmdInputFileType = type;
    }

    getCmdInputFileType(): string {
        return this._config.cmdInputFileType;
    }
}