import * as Sequelize from 'sequelize';
import axios from 'axios';
import { path } from 'ramda';
import * as iconv from 'iconv-lite';
import * as encodings from 'iconv-lite/encodings';
import getErrorReport from "./domain/ErrorReport";
// @ts-ignore
iconv.encodings = encodings;

const { log, error: logError } = console;

export interface User {
    id?: string;
    name?: string
    department?: string;
}

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
    user?: User;
}

export interface RequestInfo {
    url: string;
    query?: object;
    body?: object;
    method: string;
    status: number;
    responseData?: string;
}

export interface DBPoolProperties {
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
    dbOn: boolean;
    slackOn: boolean;
    dbProperties?: DBProperties;
    slackProperties?: SlackProperties;
}

class ErrorReporter {
    private static instance = null;
    private static sequelize;
    private static slackProperties: SlackProperties;
    private static errorReport: any;
    private static dbOn: any;
    private static slackOn: any;


    private constructor() {
    }

    static async getInstance(config: Config) {
        ErrorReporter.dbOn = config.dbOn;
        ErrorReporter.slackOn = config.slackOn;
        // TODO: 리밋
        // TODO: 리커넥션
        // TODO: 설정 custom
        if ( config.dbOn && ErrorReporter.instance === null ) {
            try {
                const { host, database = 'innodb', dialect = 'mysql', username, password , port = 3306, pool = {
                    max: 10,
                    min: 1,
                    acquire: 20000,
                    idle: 20000,
                }} = config.dbProperties;
                this.sequelize = new Sequelize( database, username, password, {
                    host,
                    dialect,
                    port,
                    pool,
                    define: {
                        charset: 'utf8',
                        collate: 'utf8_general_ci',
                        timestamps: true
                    },
                    operatorsAliases: false,
                    retry: { max: 2 },
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
        } else {
            ErrorReporter.slackProperties = config.slackProperties;
            ErrorReporter.instance = new this();
            console.log(ErrorReporter.instance)
        }
        return ErrorReporter.instance;
    }

    isInitialize() {
        return ErrorReporter.instance !== null;
    }

    saveError( error: ErrorInfo ){
        if ( !ErrorReporter.dbOn ) {
            return;
        }
        const stringify1 = value => JSON.stringify(value, null, 1);
        // TODO: error 객체 처리
        const {
            type, name, message, code, errno, syscall, hostname, status, statusText,
        } = error;
        const reqInfo = path([ 'reqInfo' ], error) || { url: null, query: null, body: null, method: null };
        const user = path([ 'user' ], error) || { id: null, name: null, department: null };
        const { url: reqUrl, query: reqQuery, body: reqBody, method: reqMethod } = reqInfo;
        const { id: userId, name: userName, department: userDepartment } = user;
        const error4DB = {
            type, name, message, code, errno, syscall, hostname, status, statusText,
            reqUrl, reqMethod, userId, userName, userDepartment,
            reqQuery: stringify1(reqQuery), reqBody: stringify1(reqBody),
        };
        return ErrorReporter.errorReport.create(error4DB);
    }

    async noticeSlack( error: ErrorInfo ) {
        if ( !ErrorReporter.slackOn ) {
            return;
        }
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
            return true;
        } catch( err ) {
            logError(err);
        }
        return false;
    }

    async procesError( error ) {
        // TODO: DB 실패시 슬랙으로
        try {
            await this.saveError(error);
        } catch(err) {
            logError(err);
        }
        try{
            await this.noticeSlack(error);
        } catch(err) {
            logError(err);
        }
    }

    close(){
        if ( ErrorReporter.sequelize )ErrorReporter.sequelize.close();
        ErrorReporter.instance = null;
    }
}

export default ErrorReporter;