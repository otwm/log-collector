import * as Sequelize from "sequelize";
import * as iconv from 'iconv-lite';
import * as encodings from 'iconv-lite/encodings';
import { Config } from "../ErrorReporter";

// @ts-ignore
iconv.encodings = encodings;

async function getDBInstance(config: Config) {
    let sequelize;
    try {
        const {
            host, database = 'innodb', dialect = 'mysql',
            username, password, port = 3306,
            pool = {
                max: 10,
                min: 1,
                acquire: 30000,
                idle: 10000,
            }
        } = config.dbProperties;
        sequelize = new Sequelize(database, username, password, {
            host,
            dialect,
            port,
            pool,
            operatorsAliases: false,
        });
        await sequelize.authenticate();
        console.log('connected');
        return sequelize;
    } catch(error) {
        console.log(error);
        throw error;
    }
    return null;
}

export default getDBInstance;