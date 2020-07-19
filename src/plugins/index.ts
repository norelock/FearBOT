import { InstanceFeature } from "../utils/interfaces";
import utils from "../utils";
import FearBot from "../client/client";
import fs from "fs";
import path from "path";

type AsyncFunction = (bot: FearBot, plugin: InstanceFeature) => Promise<void>;

/**
 * @class
 * @classdesc Class that contains all plugins and initializes them.
 */
//

export default class Plugins {
    bot: FearBot;
    plugins: InstanceFeature[];

    constructor(bot: FearBot, plugins: InstanceFeature[]) {
        this.bot = bot;
        this.plugins = plugins;
    }

    public async init() {
        const pluginsFolder = fs.existsSync(
            path.join(process.cwd(), "/src/plugins")
        ) ? "/src/plugins" : "/plugins";

        const pluginsFiles = fs
            .readdirSync(path.join(process.cwd(), pluginsFolder))
            .map((name) => name.split(".").slice(0, -1).join("."))
            .filter((name) => name !== "index");

        if (this.plugins.length > 0) {
            this.plugins.forEach(async (plugin) => {
                if (!plugin.enabled) return;
                if (!pluginsFiles.includes(plugin.name))
                    return utils.logs(
                        `[PLUGINS] Wtyczka pod nazwą ${plugin.name} nie istnieje w folderze /plugins!`,
                        "info"
                    );
                    
                const {
                    default: pluginFunction,
                }: { default: AsyncFunction } = require("./" + plugin.name);

                utils.logs(`[PLUGINS] Wczytano wtyczkę ${plugin.name}`, "info");
                
                await pluginFunction(this.bot, plugin);
                setInterval(async () => {
                    await pluginFunction(this.bot, plugin);
                }, 500);
            });
        } else
            utils.logs(`[EVENTS] Nie ma wtyczek do załadowania`, "info");
    }
}
