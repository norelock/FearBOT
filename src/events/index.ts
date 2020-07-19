import { InstanceFeature, InstanceFeatureConfig } from "../utils/interfaces";
import utils from "../utils";
import FearBot from "../client/client";
import fs from "fs";
import path from "path";

type AsyncFunction = (bot: FearBot, event: InstanceFeature, cache: any, footer: string) => Promise<void>;

/**
 * @class
 * @classdesc Class that contains all events and initializes them.
 */
//

export default class Events {
    bot: FearBot;
    events: InstanceFeature[];
    cache: any;
    footer: string;

    constructor(bot: FearBot, events: InstanceFeature[], cache: any, footer: string) {
        this.bot = bot;
        this.events = events;
        this.cache = cache;
        this.footer = footer;
    }

    public async init() {
        const eventsFolder = fs.existsSync(
            path.join(process.cwd(), "/src/events")
        ) ? "/src/events" : "/events";

        const eventsFiles = fs
            .readdirSync(path.join(process.cwd(), eventsFolder))
            .map((name) => name.split(".").slice(0, -1).join("."))
            .filter((name) => name !== "index");

        if (this.events.length > 0) {
            this.events.forEach(async (event) => {
                if (!event.enabled) return;
                if (!eventsFiles.includes(event.name))
                    return utils.logs(
                        `[EVENTS] Wydarzenie pod nazwą ${event.name} nie istnieje w folderze /events!`,
                        "info"
                    );
                    
                const {
                    default: eventFunction,
                }: { default: AsyncFunction } = require("./" + event.name);

                utils.logs(`[EVENTS] Wczytano wydarzenie ${event.name}`, "info");
                
                await eventFunction(this.bot, event, this.cache, this.footer);
                const eventInterval = utils.parseIntervalToSeconds(event.interval as any);
                setInterval(async () => {
                    await eventFunction(this.bot, event, this.cache, this.footer);
                }, eventInterval as any);
            });
        } else
            utils.logs(`[EVENTS] Nie ma wydarzeń do załadowania`, "info");
    }
}
