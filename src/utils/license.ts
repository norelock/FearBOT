/**
* @class
* @classdesc Class that contains licensing of application
*/
//

import axios from "axios";
import moment from "moment";
import utils from ".";

export default class License {
    licenseKey: string;
    started: boolean;
    serverInfo: any;

    constructor(licenseKey: string, serverInfo: any) {
        this.licenseKey = licenseKey;
        this.serverInfo = serverInfo;
        this.started = false;

        utils.logs("Sprawdzam licencje..", "info");
        moment.locale("pl");
        this.checkOnStart()
    }

    private async checkOnStart() {
        if (typeof this.serverInfo === "object" && this.licenseKey) {
            const licenseInfo = (await axios.get("https://licensing.vexir.live/check/" + this.licenseKey)).data;

            if (licenseInfo.error)
                switch (licenseInfo.errorCode) {
                    case "LICENSE_NOT_FOUND":
                        utils.logs("[LICENSE] Taki klucz licencyjny nie istnieje!", "error");
                    case "LICENSE_BLOCKED":
                        utils.logs("[LICENSE] Ten klucz licencyjny został zablokowany!", "error");
                }
            else
                if (this.serverInfo.virtualserverUniqueIdentifier === licenseInfo.suid) {
                    if (licenseInfo.is_expired)
                        utils.logs("[LICENSE] Ten klucz licencyjny wygasł!", "error");

                    console.log(`\nInformacje o licencji:\n  ● Właściciel licencji: ${licenseInfo.owner} (ID: ${licenseInfo.suid})\n  ${licenseInfo.is_expired ? "● Licencja wygasła" : "● Licencja zgaśnie w " + moment(licenseInfo.expires).format("LLLL")}\n`), this.started = true;
                } else
                    utils.logs("[LICENSE] Ten klucz licencyjny nie należy do tego serwera!", "error");
        }
    }

    public async canStartApp() {
        return this.started;
    }

    public async check() {
        if (typeof this.serverInfo === "object" && this.licenseKey) {
            const licenseInfo = (await axios.get("https://licensing.vexir.live/check/" + this.licenseKey)).data;

            if (licenseInfo.error)
                switch (licenseInfo.errorCode) {
                    case "LICENSE_NOT_FOUND":
                        utils.logs("[LICENSE] Ten klucz licencyjny nie istnieje!", "error");
                    case "LICENSE_BLOCKED":
                        utils.logs("[LICENSE] Ten klucz licencyjny został zablokowany!", "error");
                }
            else {
                if (this.serverInfo.virtualserverUniqueIdentifier === licenseInfo.suid) {
                    if (licenseInfo.is_expired)
                        utils.logs("[LICENSE] Ten klucz licencyjny wygasł!", "error");
                } else
                    utils.logs("[LICENSE] Ten klucz licencyjny nie należy do tego serwera!", "error");
            }
        }
    }
}