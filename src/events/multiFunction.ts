import FearBot from "../client/client";
import moment from "moment";
import { InstanceFeature } from "../utils/interfaces";

const multiFunction = async (bot: FearBot, event: InstanceFeature, cache: any, footer: string) => {
    let clock = () => {
        let currentDate = new Date();
        return `${currentDate.getHours() < 10 ? "0" + currentDate.getHours() : currentDate.getHours()}:${currentDate.getMinutes() < 10 ? "0" + currentDate.getMinutes() : currentDate.getMinutes()}`
    };

    let replaceMessage = (message: string, serverInfo: any, hostInfo: any) => {
        let replace = [
            {
                from: "[online]",
                to: serverInfo.virtualserverClientsonline - serverInfo.virtualserverQueryclientsonline
            },
            {
                from: "[max_slots]",
                to: serverInfo.virtualserverMaxclients
            },
            {
                from: "[channels]",
                to: serverInfo.virtualserverChannelsonline
            },
            {
                from: "[ping]",
                to: Math.floor(serverInfo.virtualserverTotalPing)
            },
            {
                from: "[uptime]",
                to: moment().add(hostInfo.instanceUptime, "seconds").fromNow(true)
            },
            {
                from: "[clock]",
                to: clock()
            }
        ];

        replace.forEach(replaced => {
            message = message.replace(replaced.from, replaced.to);
        });

        return message;
    };

    let serverInfo = await bot.serverInfo();
    let hostInfo = await bot.hostInfo();

    for (const channel of event.config.channels!) {
        if (channel.enabled) {
            let channelInfo = await bot.channelInfo(channel.channel_id);

            if (channelInfo.channelName !== replaceMessage(channel.channel_name, serverInfo, hostInfo))
                bot.channelEdit(channel.channel_id, {
                    channelName: replaceMessage(channel.channel_name, serverInfo, hostInfo),
                    channelDescription: footer
                });
        }
    }
};

export default multiFunction;
