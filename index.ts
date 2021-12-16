import { ConfigModes, ConfigService } from "./src/services/config.service";
import configFile from "./config.json"
import { CmdHandler } from "./src/handler/cmd.handler";
import { ConsoleLogService, FileLogService, LogServiceInterface } from "./src/services/log.service";
import { exit } from "./src/utilities";

class DistanceCalculator {
    _logServices: LogServiceInterface[];

    constructor(logServices: LogServiceInterface[]) {
        this._logServices = logServices;
    }

    errorLog(error: string) {
        for (const logService of this._logServices) {
            logService.errorLog(error);
        }
    }

    infoLog(info: string) {
        for (const logService of this._logServices) {
            logService.infoLog(info);
        }
    }

    async start() {
        let configService: ConfigService = ConfigService.Instance;
        try {
            configService.readConfigFile(configFile);

            switch (configService.getConfigMode()) {
                case ConfigModes.CMD:
                    await new CmdHandler([new ConsoleLogService(), FileLogService.Instance]).start();
                    break;
                case ConfigModes.REST:
                    break;
                default:
                    break;
            }
        } catch (error) {
            this.errorLog(error);
            if (configService.getConfigMode() == ConfigModes.CMD) {
                exit();
            }
            return;
        }
    }
}

new DistanceCalculator([new ConsoleLogService(), FileLogService.Instance]).start()