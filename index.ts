import { ConfigModes, ConfigService } from "./src/services/config.service";
import configFile from "./config.json"
import { CmdHandler } from "./src/handler/cmd.handler";
import { ConsoleLogService } from "./src/services/log.service";
import { exit } from "./src/utilities";

async function start() {
    let configService: ConfigService = ConfigService.Instance;

    try {
        configService.readConfigFile(configFile);

        let configMode: string = configService.getConfigMode();
        switch (configMode) {
            case ConfigModes.CMD:
                await new CmdHandler(configService.getCmdInputFileType(), [new ConsoleLogService()]).start();
                break;
            case ConfigModes.REST:
                break;
            default:
                break;
        }

        exit();
    } catch (error) {
        console.log(error);
        if (configService.getConfigMode() == ConfigModes.CMD) {
            exit();
        }
        return;
    }
}

start();