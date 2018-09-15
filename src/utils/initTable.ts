import { SyncOptions } from "sequelize";
import { Config } from "../ErrorReporter";
import getDBInstance from "./getDBInstance";
import getErrorReport from "../domain/ErrorReport";

const { log, error: logError } = console;

// TODO: table name configure
async function initTable(config: Config, option?: SyncOptions) {
    try {
        const { force } = option || { force: false };
        const sequelize = await getDBInstance(config);
        const ErrorReport = getErrorReport(sequelize);
        await ErrorReport.sync({ force });

        // TODO: table name configure
        log('initialize success');
    } catch (error) {
        logError(error);
    }
    return true;
}

export default initTable;