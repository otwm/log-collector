import { SyncOptions } from "sequelize";
import { Config } from "../ErrorReporter";
import getDBInstance from "./getDBInstance";
import getErrorReport from "../domain/ErrorReport";
import getUserTracking from "../domain/UserTracking";

const { log, error: logError } = console;

// TODO: table name configure
async function initErrorReportTable(config: Config, tableName?: string, option?: SyncOptions) {
    try {
        const { force } = option || { force: false };
        const sequelize = await getDBInstance(config);
        const ErrorReport = getErrorReport(sequelize, tableName);
        await ErrorReport.sync({ force });

        // TODO: table name configure
        log('initialize success');
    } catch (error) {
        logError(error);
    }
    return true;
}

async function initUserTrackingTable(config: Config, tableName?: string, option?: SyncOptions) {
    try {
        const { force } = option || { force: false };
        const sequelize = await getDBInstance(config);
        const UserTracking = getUserTracking(sequelize, tableName);
        await UserTracking.sync({ force });

        // TODO: table name configure
        log('initialize success');
    } catch (error) {
        logError(error);
    }
    return true;
}

export {
    initErrorReportTable,
    initUserTrackingTable,
}
