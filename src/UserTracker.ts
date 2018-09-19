import * as Sequelize from 'sequelize';
import { path } from "ramda";
import getUserTraking from "./domain/UserTracking";
import {defaultOption} from "./common/constants";

const { error: logError } = console;

/**
 * 사용자 오퍼레이션
 */
export enum Operation {
    Insert = 1,
    Update,
    Delete,
    Select,
    Merge,
}

/**
 * 액션
 */
export interface ActionInfo {
    displayName?: string,
    actionName: string,
    operation: Operation,
    params?: object,
}

export interface UserTrackerConfig {
    dbProperties?: object;
    sequelize?: any; // TODO:
    saveReconnect?: boolean;
}

class UserTracker {
    private static instance: UserTracker = null;
    private static sequelize;
    private static userTraking: any;
    private static saveReconnect: boolean;
    private static config: UserTrackerConfig;

    private constructor() {
    }

    static async getInstance(config: UserTrackerConfig) {
        UserTracker.config = config;
        return await UserTracker.connect();
    }

    static async connect() {
        const config = UserTracker.config;
        const sequelize = path(['sequelize'], config);
        const dbProperties = path(['dbProperties'], config);
        const saveReconnect = path(['saveReconnect'], config) || true;
        UserTracker.saveReconnect = saveReconnect;
        if ( sequelize ) {
            UserTracker.sequelize = sequelize;
            UserTracker.instance = new this();
            UserTracker.userTraking = getUserTraking(UserTracker.sequelize);
            return UserTracker.instance;
        }
        if ( dbProperties ) {
            try {
                UserTracker.sequelize = new Sequelize(Object.assign({}, defaultOption, dbProperties));
                UserTracker.instance = new this();
                UserTracker.userTraking = getUserTraking(this.sequelize);
                return UserTracker.instance;
            } catch (err) {
                logError(`connection error: ${err}`);
            }
        }
        throw new Error('nothing db props!!!');
    }

    isInitialize() {
        return UserTracker.instance !== null;
    }

    async save(actionInfo: ActionInfo) {
        const { saveReconnect = true } = UserTracker;
        if ( saveReconnect && !UserTracker.sequelize) {
            await UserTracker.connect();
        }
        return UserTracker.userTraking.create(actionInfo);
    }

    close(){
        if ( UserTracker.sequelize )UserTracker.sequelize.close();
        UserTracker.instance = null;
    }
}

export default UserTracker;