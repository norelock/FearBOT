import FearBot from "../client/client";
import { InstanceFeature } from "../utils/interfaces";

const serverName = async (bot: FearBot, plugin: InstanceFeature) => {
    let replaceMessage = (message: string, serverInfo: any) => {
        let replace = [
            {
                from: "[online]",
                to: serverInfo.virtualserverClientsonline - serverInfo.virtualserverQueryclientsonline
            },
            {
                from: "[max_slots]",
                to: serverInfo.virtualserverMaxclients
            }
        ];

        replace.forEach(replaced => {
            message = message.replace(replaced.from, replaced.to);
        });

        return message;
    };

    let serverInfo = await bot.serverInfo();

    if (serverInfo.virtualserverName !== replaceMessage(plugin.config.server_name!, serverInfo))
        bot.serverEdit({
            virtualserverName: replaceMessage(plugin.config.server_name!, serverInfo)
        });
};

export default serverName;
