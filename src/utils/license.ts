"use strict";

import axios from "axios";
import moment from "moment";
import utils from ".";

/**
* @class
* @classdesc Class that contains licensing of application
*/
//

export default class License {
    start: boolean;
    logPrefix: string;
    licensingUrl: string;
    licenseKey: string;
    serverUid: string;

    constructor(licenseKey: string, serverUid: string) {
        moment.locale("pl");

        this.logPrefix = "[LICENSE]";
        this.start = false;
        this.licensingUrl = "https://licensing.vexir.live";

        this.licenseKey = licenseKey;
        this.serverUid = serverUid;

        utils.logs(
            `${this.logPrefix} Sprawdzanie informacji o licencji..`,
            "info"
        );

        this.onStartCheck();
    }

    public async canStart() {
        return this.start;
    }

    private async onStartCheck() {
        if (this.licenseKey && this.serverUid) {
            if (!this.start) {
                const licenseGetter = await axios.get(
                    `${this.licensingUrl}/check/${this.licenseKey}`
                );
                const getterData = licenseGetter.data;

                if (getterData.error) {
                    switch (getterData.error_code) {
                        case "LICENSE_NOT_FOUND":
                            return utils.logs(`${this.logPrefix} Ten klucz licencyjny nie istnieje!`, "error");
                    }
                }

                console.log(
                    `\nInformacje o licencji:\n  ● Właściciel licencji: ${
                        getterData.owner
                    } (ID: ${getterData.suid})\n  ${
                        getterData.is_expired
                            ? "● Licencja wygasła"
                            : "● Licencja zgaśnie w " +
                              moment(getterData.expires).format("LLLL")
                    }\n`
                );

                if (!getterData.is_expired) {
                    utils.logs(
                        `${this.logPrefix} Wczytano licencje, sprawdzanie SUID..`,
                        "info"
                    );

                    if (getterData.suid === this.serverUid)
                        utils.logs(
                            `${this.logPrefix} Wczytuje aplikację..`,
                            "info"
                        ), this.start = true;
                    else
                        utils.logs(
                            `${this.logPrefix} SUID nie zgadza się z aktualnym na serwerze.`,
                            "error"
                        );
                } else
                    utils.logs(
                        `${this.logPrefix} Licencja wygasła. Aby ją przedłużyć - skontaktuj się z nami.`,
                        "error"
                    );
            }
        }
    }

    public async check() {
        if (this.licenseKey && this.serverUid) {
            if (this.start) {
                const licenseGetter = await axios.get(
                    `${this.licensingUrl}/check/${this.licenseKey}`
                );
                const getterData = licenseGetter.data;

                if (getterData.error) {
                    switch (getterData.error_code) {
                        case "LICENSE_NOT_FOUND":
                            return utils.logs(`${this.logPrefix} [CHECK] Licencja została usunięta. Nie możesz już dalej używać aplikacji.`, "error");
                    }
                }

                if (!getterData.is_expired) { //
                    if (getterData.suid !== this.serverUid)
                        utils.logs(
                            `${this.logPrefix} [CHECK] SUID zostało zmienione przez właściciela licencji. Nie możesz już dalej używać aplikacji.`,
                            "error"
                        );
                } else
                    utils.logs(
                        `${this.logPrefix} [CHECK] Licencja wygasła. Nie możesz już dalej używać aplikacji.`,
                        "error"
                    );
            }
        }
    }
}
