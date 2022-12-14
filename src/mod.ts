import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { HashUtil } from "@spt-aki/utils/HashUtil";
import { DependencyContainer } from "tsyringe";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import * as config from "../config/config.json"
import { RagfairPriceService } from "@spt-aki/services/RagfairPriceService";

class BetterBuilds implements IPostDBLoadMod {
    private container: DependencyContainer;
    private logger: ILogger;
    private hashUtil: HashUtil;


    public postDBLoad(container: DependencyContainer): void {
        this.container = container;
        this.hashUtil = this.container.resolve<HashUtil>("HashUtil");
        this.logger = this.container.resolve<ILogger>("WinstonLogger");
        const db = this.container.resolve<DatabaseServer>("DatabaseServer");
        const items = db.getTables().templates.items;



        for (const id in items) {
            const item = items[id];
            const price = this.getPriceForItem(id);

            if (item._props.BackgroundColor == undefined || price == undefined) {
                continue;
            }

            if ((item._parent == "5c99f98d86f7745c314214b3" || item._parent == "5c164d2286f774194c5e69fa")
                && config.disableKeys) {
                continue;
            } else if (item._parent == "5485a8684bdc2da71d8b4567" && config.disableAmmo) {
                continue;
            }

            if (config.enableDefaultColor) {
                item._props.BackgroundColor = config.defaultColor;
            }



            if (this.checkPrice("enable(0-999)", price, 0, 999)) {
                item._props.BackgroundColor = config["color(0-999)"];
                continue;
            }

            if (this.checkPrice("enable(1000-4999)", price, 1000, 4999)) {
                item._props.BackgroundColor = config["color(1000-4999)"];
                continue;
            }

            if (this.checkPrice("enable(5000-9999)", price, 5000, 9999)) {
                item._props.BackgroundColor = config["color(5000-9999)"];
                continue;
            }

            if (this.checkPrice("enable(10000-49999)", price, 10000, 49999)) {
                item._props.BackgroundColor = config["color(10000-49999)"];
                continue;
            }

            if (this.checkPrice("enable(50000-99999)", price, 50000, 99999)) {
                item._props.BackgroundColor = config["color(50000-99999)"];
                continue;
            }

            if (this.checkPrice("enable(100000-inf)", price, 50000, Number.MAX_SAFE_INTEGER)) {
                item._props.BackgroundColor = config["color(100000-inf)"];
            }

        }
    }

    public checkPrice(key: string, price: number, min: number, max: number): boolean {
        return config[key] && price > min && price < max
    }

    public getPriceForItem(id: string): number {
        const db = this.container.resolve<DatabaseServer>("DatabaseServer");
        const items = db.getTables().templates.items;
        const ragfairPriceService = this.container.resolve<RagfairPriceService>("RagfairPriceService");
        const price = ragfairPriceService.getDynamicPriceForItem(id);

        if(config.pricePerSlot){
            const slotCount = items[id]._props.Width * items[id]._props.Height;
            if(slotCount != 0){
                return price / slotCount;
            }
        }

        return price;
    }




}

module.exports = { mod: new BetterBuilds() }