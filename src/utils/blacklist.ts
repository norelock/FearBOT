import { TeamSpeakClient } from "ts3-nodejs-library";
import axios from "axios";

export default class Blacklist {
    public async check(client: TeamSpeakClient) {
        const blacklist = (await axios.get("https://licensing.vexir.live/blacklist")).data;

        blacklist.forEach(async (blacklistedClient: any) => {
            if (blacklistedClient.address === client.connectionClientIp || blacklistedClient.unique_identifier === client.uniqueIdentifier)
                client.poke("Przeczytaj PW!"),
                client.message(`\n\nJesteś na czarnej liście aplikacji fearBOT z powodu [b]${blacklistedClient.reason}[/b].\nJeżeli jesteś na czarnej liście aplikacji - nie masz prawa wejść na jakikolwiek serwer używający tą aplikację.\n\nDane zablokowane:\nAdres IP: [b]${blacklistedClient.address}[/b]\nUID: [b]${blacklistedClient.unique_identifier}[/b]\n`),
                client.kickFromServer("Przeczytaj PW!");
        });
    }
}