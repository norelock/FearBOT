import FearBot from "../client/client";
import { InstanceFeature } from "../utils/interfaces";
import moment from "moment";

let adminsOnline = async (bot: FearBot, event: InstanceFeature, cache: any, footer: string) => {
    moment.locale("pl");
    
    let parseTimeToSeconds = (time: any) => {
        let { seconds, minutes, hours, days } = time;

        if (seconds === 0 && minutes === 0 && hours === 0 && days === 0) {
            return false;
        }

        return (seconds + minutes * 60 + hours * 3600 + days * 86400) * 1000;
    };

    let replaceMessage = (message: string, count: any) => {
        let replace = [
            {
                from: "[online]",
                to: count
            }
        ];

        replace.forEach(replaced => {
            message = message.replace(replaced.from, replaced.to);
        });

        return message;
    };

    let channelInfo = await bot.channelInfo(event.config.channel_id!);
    let description = event.config.channel_description + "[list]";
    let onlineCount = 0;

    for (let group of event.config.admin_groups!) {
        for (let client of await bot.clientList({clientType: 0})) {
            if (client.servergroups.indexOf(group) >= 0) {
                let clientInfo = await bot.clientInfo(client.clid);
                let clientData = clientInfo[0];//
                
                if (!(parseTimeToSeconds(event.config.away_time) < client.idleTime || client.outputMuted || client.away))
                    onlineCount++;

                description += `[*][url=client://${client.clid}/${client.uniqueIdentifier}]${client.nickname}[/url] jest ${parseTimeToSeconds(event.config.away_time) < client.idleTime || client.outputMuted || client.away 
                    ? "zajęty (AFK) przez [b]" + moment().add(client.idleTime / 1000, "seconds").fromNow(true) 
                    : "dostępny ([b]" + moment().add(clientData.connectionConnectedTime / 1000, "seconds").fromNow(true).toLowerCase() + "[/b] od dołączenia na serwer)"}`;
            }
        }
    }

    description += "[/list]";

    if (channelInfo.channelName !== replaceMessage(event.config.channel_name!, event.config.channel_id))
        bot.channelEdit(event.config.channel_id!, {
            channelName: replaceMessage(event.config.channel_name!, onlineCount)
        });

    bot.channelEdit(event.config.channel_id!, {
        channelDescription: description + footer
    });
};

export default adminsOnline;