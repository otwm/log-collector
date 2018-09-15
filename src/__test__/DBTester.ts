import * as iconv from 'iconv-lite';
import * as encodings from 'iconv-lite/encodings';
import { Config } from '../ErrorReporter';
import getErrorReport from "../domain/ErrorReport";
import getDBInstance from "../utils/getDBInstance";

// @ts-ignore
iconv.encodings = encodings;

const { log, error: logError } = console;

class DBTester {
    private static instance = null;
    private static sequelize;

    private constructor() {
    }

    static async getInstance(config: Config) {
        if ( DBTester.instance === null ) {
            this.sequelize = await getDBInstance(config);
            DBTester.instance = new this();
            log('initialized');
        }
        return DBTester.instance;
    }

    isInitialize() {
        return DBTester.instance !== null;
    }

    async getLastOne(){
        try {
            const { sequelize } = DBTester;
            const ErrorReport = getErrorReport(sequelize);
            const lastOne = await ErrorReport.findOne({
                limit: 1,
                order: [
                    ['id', 'DESC'],
                ],
            });
            return lastOne;
        } catch( err ) {
            logError( err );
        }
        return {};
    }

    async getCount(){
        try {
            const { sequelize } = DBTester;
            const ErrorReport = getErrorReport(sequelize);
            const count = await ErrorReport.findOne({
                attributes: [[ sequelize.fn('COUNT', '*'), 'count' ]],
            });
            return count.get("count");
        } catch( err ) {
            logError( err );
        }
        return {};
    }

    close(){

    }
}

export default DBTester;