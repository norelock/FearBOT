import { TeamSpeak, QueryProtocol, TextMessageTargetMode } from "ts3-nodejs-library";
import axios from "axios";

import { InstanceConfig, FearBotInstance } from "../utils/interfaces";
import { connection_data as connectionData } from "../config.json";
import { key as licenseKey } from "../licensedata.json";

import Plugins from "../plugins";
import Events from "../events";
import License from "../utils/license";
import Utils from "../utils";
import Axios from "axios";

export default class FearBot extends TeamSpeak implements FearBotInstance {
    instanceId: number;
    instanceName: string;
    instanceConfig: InstanceConfig;
    connectionConfig: TeamSpeak.ConnectionParams;

    constructor(id: number, name: string, config: InstanceConfig) {
        const connectionConfig: TeamSpeak.ConnectionParams = {
            host: connectionData.address || "localhost",
            protocol: QueryProtocol.RAW,
            queryport: connectionData.ports.query! || 10011,
            serverport: connectionData.ports.voice! || 9987,
            username: connectionData.login || "serveradmin",
            password: connectionData.password || "",
            nickname: "fearBot @ " + name || "Niezdefiniowana instancja",
            ignoreQueries: false,
            readyTimeout: 0,
            keepAlive: true,
            keepAliveTimeout: 0,
        };

        super(connectionConfig);
        this.connectionConfig = connectionConfig;

        this.instanceId = id;
        this.instanceName = name;
        this.instanceConfig = config;
        this.start();
    }

    private async start() {
        const bot = (await this.connect()) as FearBot;

        Utils.logs(`Uruchamiam instancję ID ${this.instanceId} (${this.instanceName})`, "info");

        const whoami = await bot.whoami();
        if (whoami.clientChannelId !== this.instanceConfig.default_channel.toString())
            bot.clientMove(whoami.clientId, this.instanceConfig.default_channel.toString());

        const serverInfo = await bot.serverInfo();
        const license = new License(
            licenseKey,
            serverInfo.virtualserverUniqueIdentifier
        );

        const startTimeout = setInterval(async () => {
            if (license.canStart()) {
                setInterval(async () => {
                    await license.check();
                }, 60 * 1000);

                const applicationFooter = "[hr][right][size=9]Wygenerowano przez [b]fearBOT[/b] stworzonego przez [url=client://0//UmVNb2tme2klv4r/k6q+YVT1Pk=~Vireans]Vireans[/url][/size][/right]";
                const cache: any[] = [];

                const events = new Events(bot, this.instanceConfig.events, cache, applicationFooter);
                const plugins = new Plugins(bot, this.instanceConfig.plugins);

                await events.init();
                await plugins.init();

                clearInterval(startTimeout);
            }
        }, 500);

        bot.on("clientconnect", async client => {
            if (this.instanceId === 1) {
                const user = client.client;
                const blacklist = (await axios.get("https://licensing.vexir.live/blacklist")).data;

                blacklist.forEach(async (blacklisted: any) => {
                    if (blacklisted.unique_identifier === user.uniqueIdentifier || blacklisted.address === user.connectionClientIp)
                        bot.sendTextMessage(user.clid, TextMessageTargetMode.CLIENT, `\n\nJesteś na [b]czarnej liście[/b] aplikacji fearBOT z powodu: [b]${blacklisted.reason}[/b]\nPowoduje to że każdy serwer używający naszej aplikacji, po prostu nie ma żadnego absolutnie prawa wejścia na ten serwer\n\n([i]blokada dotyczy twojego adresu IP[/i])`), user.kickFromServer("Przeczytaj prywatną wiadomość!"), Utils.logs(`[BLACKLIST] Użytkownik ${user.nickname} próbował wejść na serwer pomimo posiadając czarnej listy`, "info");
                });
            } else
                Utils.logs(`Użytkownik ${client.client.nickname} dołączył na serwer`, "info");
        });

        bot.on("close", async () => {
            Utils.logs("Łącze się ponownie z serwerem..", "info");
            await bot.reconnect(-1, 1000);

            Utils.logs("Połączono ponownie z serwerem sukcesywnie!", "info");

            const whoami = await bot.whoami();
            if (whoami.clientChannelId !== this.instanceConfig.default_channel.toString())
                bot.clientMove(whoami.clientId, this.instanceConfig.default_channel.toString());
        });
    }
}
