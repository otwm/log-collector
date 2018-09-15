import * as Sequelize from 'sequelize';
import * as iconv from 'iconv-lite';
import * as encodings from 'iconv-lite/encodings';
// @ts-ignore
iconv.encodings = encodings;

const { log, error: logError } = console;

export interface Error {
    type: string;
    name: string;
    message: string;
    code: string;
    errno: string;
    syscall: string;
    hostname: string;
    status: number;
    statusText: string;
    reqInfo: RequestInfo;
    date: string;
}

export interface RequestInfo {
    url: string;
    query: string;
    body: string;
    method: string;
    status: number;
    responseData: string;
}

export interface DBPoolProperties{
    max: number;
    min: number;
    acquire: number;
    idle: number;
}

export interface DBProperties {
    host:string;
    dialect?:string;
    database?:string;
    username:string;
    password:string;
    port?: number;
    pool?: DBPoolProperties;
}

export interface SlackProperties {
    url: string;
}

export interface Config {
    dbProperties: DBProperties;
    slackProperties: SlackProperties;
}

class ErrorReporter {
    private static instance = null;
    private static sequelize;
    private static slackProperties: SlackProperties;

    private constructor() {
    }

    static async getInstance(config: Config) {
        if ( ErrorReporter.instance === null ) {
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
                ErrorReporter.slackProperties = config.slackProperties;
                ErrorReporter.instance = new this();
            } catch(error) {
                logError(error);
            }
        }
        return ErrorReporter.instance;
    }

    isInitialize() {
        return ErrorReporter.instance !== null;
    }

    saveError( error: Error ){
        console.log(error);
    }

    noticeSlack( error ) {
        console.log(error);
        log(ErrorReporter.slackProperties);
    }

    procesError( error ) {
        this.saveError(error);
        this.procesError(error);
    }

    close(){

    }
}

export default ErrorReporter;