import * as Sequelize from 'sequelize';
import axios from 'axios';
import { path } from 'ramda';
import * as iconv from 'iconv-lite';
import * as encodings from 'iconv-lite/encodings';
import getErrorReport from "./domain/ErrorReport";
import {defaultOption} from "./common/constants";
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
    saveReconnect: boolean;
}

export interface SlackProperties {
    url: string;
}

export interface Config {
    dbOn: boolean;
    slackOn: boolean;
    dbProperties?: object;
    sequelize?: any;
    slackProperties?: SlackProperties;
}

class ErrorReporter {
    private static instance = null;
    private static sequelize;
    private static slackProperties: SlackProperties;
    private static errorReport: any;
    private static dbOn: any;
    private static slackOn: any;
    private static saveReconnect: boolean;
    private static config: Config;

    private constructor() {
    }

    static async getInstance(config: Config) {
        ErrorReporter.dbOn = config.dbOn;
        ErrorReporter.slackOn = config.slackOn;
        ErrorReporter.config = config;
        if ( config.dbOn && ErrorReporter.sequelize === null ) {
            await ErrorReporter.connect();
        }
        if ( config.slackProperties ){
            ErrorReporter.slackProperties = config.slackProperties;
            log('slack props set!');
        }
        ErrorReporter.instance = new this();
        return ErrorReporter.instance;
    }

    static async connect() {
        const config = ErrorReporter.config;
        const sequelize = path(['sequelize'], config);
        const dbProperties = path(['dbProperties'], config);
        const saveReconnect = path(['saveReconnect'], config) || true;
        ErrorReporter.saveReconnect = saveReconnect;
        if ( sequelize ) {
            ErrorReporter.sequelize = sequelize;
            ErrorReporter.instance = new this();
            ErrorReporter.errorReport = getErrorReport(ErrorReporter.sequelize);
            return ErrorReporter.instance;
        }
        if ( dbProperties ) {
            try {
                ErrorReporter.sequelize = new Sequelize(Object.assign({}, defaultOption, dbProperties));
                ErrorReporter.instance = new this();
                ErrorReporter.errorReport = getErrorReport(this.sequelize);
                return ErrorReporter.instance;
            } catch (err) {
                logError(`connection error: ${err}`);
            }
        }
        throw new Error('nothing db props!!!');
    }

    isInitialize() {
        return ErrorReporter.instance !== null;
    }

    async saveError( error: ErrorInfo ){
        if ( !ErrorReporter.dbOn ) {
            return;
        }
        const { saveReconnect = true } = ErrorReporter;
        if ( saveReconnect && !ErrorReporter.sequelize) {
            log('reconnect ...');
            await ErrorReporter.connect();
        }
        const stringify1 = value => JSON.stringify(value, null, 1);
        const type = path(['type'], error);
        const name = path(['name'], error);
        const message = path(['message'], error);
        const code = path(['code'], error);
        const errno = path(['errno'], error);
        const syscall = path(['syscall'], error);
        const hostname = path(['hostname'], error);
        const status = path(['status'], error);
        const statusText = path(['statusText'], error);

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
        let dbError = null;
        try {
            await this.saveError(error);
        } catch(err) {
            logError(err);
            dbError = err;
        }
        try {
            await this.noticeSlack(error);
        } catch(err) {
            logError(err);
        }
        if (dbError !== null) {
            try {
                await this.noticeSlack({ ...dbError, errorType: 'db error'});
            } catch(err) {
                logError(err);
            }
        }
    }

    // async procesError( error ) {
    //     try {
    //         this.saveError(error);
    //     } catch (err) {
    //
    //     }
    //
    //     try {
    //         await this.noticeSlack(error);
    //     } catch(err) {
    //         logError(err);
    //     }
        // return this.saveError(error).then(result => {
        //     log(result);
        //     this.noticeSlack(error).then(data => {
        //         log(data);
        //     });
        // }).catch(err => {
        //     this.noticeSlack({...err, errorType: 'error report fail!!!' }).then(data => {
        //         log(data);
        //     });
        // });
    // }

    close(){
        if ( ErrorReporter.sequelize )ErrorReporter.sequelize.close();
        ErrorReporter.instance = null;
    }
}

export default ErrorReporter;