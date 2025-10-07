"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleHistoriqueCleanup = scheduleHistoriqueCleanup;
const node_cron_1 = __importDefault(require("node-cron"));
const historique_service_1 = require("../services/historique.service");
function scheduleHistoriqueCleanup(cronExpr = "0 0 * * *") {
    node_cron_1.default.schedule(cronExpr, async () => {
        try {
            const result = await (0, historique_service_1.deleteOldHistoriques)();
            if (result.count > 0) {
                console.log(`Deleted ${result.count} historiques older than 7 days.`);
            }
        }
        catch (err) {
            console.error("Error running historique cleanup job:", err);
        }
    });
    console.log(`[Scheduler] Historique cleanup scheduled (${cronExpr})`);
}
