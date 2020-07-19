import FearBot from "../client/client";
import { InstanceFeature } from "../utils/interfaces";

const noAwayClients = async (bot: FearBot, event: InstanceFeature, cache: any, footer: string) => {
    let parseTimeToSeconds = (time: any) => {
        let { seconds, minutes, hours, days } = time;

        if (seconds === 0 && minutes === 0 && hours === 0 && days === 0) {
            return false;
        }

        return (seconds + minutes * 60 + hours * 3600 + days * 86400) * 1000;
    };

    let nameByCount = (count: number) => {
        let name = "osoba";

        if (count === 1)
            name = "osoba";
        else if (count === 2 || count === 3 || count === 4)
            name = "osoby";
        else if (count > 4)
            name = "osób";
        else
            name = "osób";

        return count + " " + name;
    };

    let replaceMessage = (message: string, count: any) => {
        let replace = [
            {
                from: "[count]",
                to: nameByCount(count)
            }
        ];

        replace.forEach(replaced => {
            message = message.replace(replaced.from, replaced.to);
        });

        return message;
    };

    let clients = await bot.clientList({clientType: 0});
    let channelInfo = await bot.channelInfo(event.config.channel_id!);

    let afkClients = 0;

    clients.forEach(async client => {
        if (parseTimeToSeconds(event.config.away_time) < client.idleTime || client.outputMuted || client.away) {
            for (let group of event.config.ignored_groups!) {
                if (!(client.servergroups.indexOf(group) >= 0)) {
                    let status = client.away ? "ustawiłeś status away" : "jesteś wyciszony";

                    if (client.cid !== event.config.channel_id)
                        client.move(event.config.channel_id!), client.poke(`${parseTimeToSeconds(event.config.away_time) < client.idleTime ? "Zostałeś przeniesiony na AFK (przez jakiś czas nic nie robiłeś)." : "Zostałeś przeniesiony na AFK (powód: " + status + ")."}`);
    
                    if (!cache.some((afkClient: { clid: string; }) => afkClient.clid === client.clid)) {
                        cache.push(
                            {
                                type: "away",
                                clid: client.clid,
                                cid: client.cid,
                            }
                        );
                    }

                    afkClients++;
                }
            }
        } else {
            if (cache.some((afkClient: { clid: string; }) => afkClient.clid === client.clid)) {
                for (var i = 0; i < cache.length; i++) {
                    if (cache[i].clid === client.clid && cache[i].type === "away") {
                        if (cache[i].cid !== client.cid)
                            client.move(cache[i].cid), client.poke("Zostałeś przeniesiony na poprzedni kanał w którym byłeś.");
                        else
                            client.poke("Ponieważ już byłeś połączony na tym kanale AFK, nie zostałeś przeniesiony.");
                        
                        cache.splice(i, 1);
                    }
                }
            }
        }
    });

    if (channelInfo.channelName !== replaceMessage(event.config.channel_name!, afkClients))
        bot.channelEdit(event.config.channel_id!, {
            channelName: replaceMessage(event.config.channel_name!, afkClients),
            channelDescription: footer
        });
};

export default noAwayClients;