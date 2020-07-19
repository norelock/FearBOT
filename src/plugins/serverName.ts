import FearBot from "../client/client";
import { InstanceFeature } from "../utils/interfaces";

const serverName = async (bot: FearBot, plugin: InstanceFeature) => {
    let replaceMessage = (message: string, serverInfo: any) => {
        let usersOnline = serverInfo.virtualserverClientsonline - serverInfo.virtualserverQueryclientsonline;
        let maxUsers = serverInfo.virtualserverMaxclients;
        let replace = [
            {
                from: "[online]",
                to: usersOnline
            },
            {
                from: "[max_slots]",
                to: maxUsers
            },
            {
                from: "[percent]",
                to: Math.round(usersOnline / maxUsers * 100)
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
