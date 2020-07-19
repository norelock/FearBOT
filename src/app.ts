import FearBot from "./client/client";
import { instances } from "./config.json";
import { InstanceConfig } from "./utils/interfaces";
import utils from "./utils";

const lines = process.stdout.getWindowSize()[1];
for (let i = 0; i < lines; i++) console.log("\r\n");

const processArguments = process.argv.splice(2);

console.log(`Witaj w interfejsie FearBOT!`);

switch (processArguments[0]) {
    case "instance":
        let id = parseInt(processArguments[1]) || undefined;
        let is = (instances as unknown) as InstanceConfig[];

        if (id === undefined || id === null)
            utils.logs("Brak ID instancji!", "error");
        else {
            is.forEach(async (instance, index) => {
                if (instance.id === id)
                    new FearBot(instance.id, instance.name, is[index]);
            });
        }

        break;
    default:
        console.log("Poprawne użycie komendy: node app.js instance <numer instancji>");
        break;
}
