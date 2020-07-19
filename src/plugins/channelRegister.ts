import FearBot from "../client/client";
import { ReasonIdentifier } from "ts3-nodejs-library";
import { InstanceFeature } from "../utils/interfaces";

const channelRegister = async (bot: FearBot, plugin: InstanceFeature) => {
    const clients = await bot.clientList({ clientType: 0 });
    const availableRanks = plugin.config.channels!.map(({ group_id }) =>
        group_id.toString()
    );
    for (const channel of plugin.config.channels!) {
        clients.forEach(async (client) => {
            if (client.cid !== channel.channel_id) return;
            if (client.servergroups.some((rank) => availableRanks.includes(rank))) {
                await bot.clientKick(
                    client.clid,
                    ReasonIdentifier.KICK_CHANNEL,
                    "Już posiadasz rangę rejestracyjną!"
                );
                await bot.clientPoke(
                    client.clid,
                    "[b][color=red]Już posiadasz rangę rejestracyjną![/color][/b]"
                );
                return;
            } else {
                if (
                    Math.round(Date.now() - client.created) / 60 >=
                    parseInt(channel.time_spent)
                ) {
                    await bot.clientKick(
                        client.clid,
                        ReasonIdentifier.KICK_CHANNEL,
                        "Pomyślnie nadano rangę rejestracyjną!"
                    );
                    await bot.clientPoke(
                        client.clid,
                        "[b][color=green]Pomyślnie nadano rangę rejestracyjną![/color][/b]"
                    );
                    await bot.serverGroupAddClient(
                        client.databaseId,
                        channel.group_id
                    );
                } else {
                    await bot.clientKick(
                        client.clid,
                        ReasonIdentifier.KICK_CHANNEL,
                        "Nie możesz jeszcze tego zrobić!"
                    );
                    await bot.clientPoke(
                        client.clid,
                        "[b][color=red]Nie możesz jeszcze dokonać rejestracji! Musisz przesiedzieć 5 minut aby się zarejestrować![/color][/b]"
                    );
                }
            }
        });
    }
};

export default channelRegister;
