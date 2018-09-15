import * as Sequelize from 'sequelize';
import axios from 'axios';
import * as iconv from 'iconv-lite';
import * as encodings from 'iconv-lite/encodings';
import getErrorReport from "./domain/ErrorReport";
// @ts-ignore
iconv.encodings = encodings;

const { log, error: logError } = console;

export interface ErrorInfo {
    type: string;
    name?: string;
    message?: string;
    code?: string;
    errno?: string;
    syscall?: string;
    hostname?: string;
    status: number;
    statusText?: string;
    reqInfo?: RequestInfo;
}

export interface RequestInfo {
    url: string;
    query?: string;
    body?: string;
    method: string;
    status: number;
    responseData?: string;
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
    private static errorReport: any;

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
                this.sequelize.transaction({
                    autocommit: true,
                });
                ErrorReporter.slackProperties = config.slackProperties;
                this.errorReport = getErrorReport(this.sequelize);

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

    saveError( error: ErrorInfo ){
        return ErrorReporter.errorReport.create(error);
    }

    async noticeSlack( error: ErrorInfo ) {
        // TODO : slack format
        const message = {
          text: `\`\`\` ${JSON.stringify(error, null, 1)} \`\`\``,
        };
        try {
            const result = await axios({
                url: ErrorReporter.slackProperties.url,
                method: 'POST',
                data: message,
                headers: {
                    'Content-type': 'application/json',
                },
            });
            if (result.statusText !== 'OK') {
                throw new Error('slack fail');
            }
            log( `slack : ${JSON.stringify(result)}`);
            return true;
        } catch( err ) {
            logError(err);
        }
        return false;
    }

    async procesError( error ) {
        await this.saveError(error);
        await this.noticeSlack(error);
    }

    close(){
        ErrorReporter.sequelize.close();
        ErrorReporter.instance = null;
    }
}

export default ErrorReporter;