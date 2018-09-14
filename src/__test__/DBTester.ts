import * as Sequelize from 'sequelize';
import * as iconv from 'iconv-lite';
import * as encodings from 'iconv-lite/encodings';
// @ts-ignore
iconv.encodings = encodings;

const { log, error: logError } = console;

interface DBPoolProperties{
    max: number;
    min: number;
    acquire: number;
    idle: number;
}

interface DBProperties {
    host:string;
    dialect?:string;
    database?:string;
    username:string;
    password:string;
    port?: number;
    pool?: DBPoolProperties;
}

interface SlackProperties {
    url: string;
}

interface Config {
    dbProperties: DBProperties;
    slackProperties: SlackProperties;
}

class DBTester {
    private static instance = null;
    private static sequelize;

    private constructor() {
    }

    static async getInstance(config: Config) {
        if ( DBTester.instance === null ) {
            try {
                const { host, database = 'innodb', dialect = 'mysql', username, password , port = 3306, pool = {
                    max: 10,
                    min: 1,
                    acquire: 30000,
                    idle: 10000,
                }} = config.dbProperties;
                this.sequelize = new Sequelize( database, username, password, {
                    host,
                    dialect,
                    port,
                    pool,
                    operatorsAliases: false,
                });
                await this.sequelize.authenticate();
                log('connected');
                DBTester.instance = new this();
            } catch(error) {
                logError(error);
            }
        }
        return DBTester.instance;
    }

    isInitialize() {
        return DBTester.instance !== null;
    }

    getLastOne(){
        return {};
    }

    close(){

    }
}

export default DBTester;