import * as Sequelize from 'sequelize';
import { path } from "ramda";
import getUserTraking from "./domain/UserTracking";

export enum Operation {
    Insert = 1,
    Update,
    Delete,
    Select,
    Merge,
}

export interface ActionInfo {
    displayName?: string,
    actionName: string,
    operation: Operation,
    params?: object,
}

export interface UserTrackerConfig {
    dbProperties?: object;
    sequelize?: any; // TODO:
}

const defaultOption = {
    pool: {
        max: 5,
        min: 1,
        acquire: 20000,
        idle: 20000,
    },
    retry: { max: 2 },
    dialect: 'mysql',
    port: 3306,
    define: {
        charset: 'utf8',
        collate: 'utf8_general_ci',
        timestamps: true
    },
    database: 'innodb',
    operatorsAliases: false,
    sync: { force: false },
};

class UserTracker {
    private static instance: UserTracker = null;
    private static sequelize;
    private static userTraking: any;

    private constructor() {
    }

    static async getInstance(config: UserTrackerConfig) {
        const sequelize = path(['sequelize'], config);
        const dbProperties = path(['dbProperties'], config);
        if ( sequelize ) {
            UserTracker.sequelize = sequelize;
            UserTracker.instance = new this();
            UserTracker.userTraking = getUserTraking(this.sequelize);
            return UserTracker.instance;
        }
        if ( dbProperties ) {
            UserTracker.sequelize = new Sequelize(Object.assign({}, defaultOption, dbProperties));
            UserTracker.instance = new this();
            UserTracker.userTraking = getUserTraking(this.sequelize);
            return UserTracker.instance;
        }
        throw new Error('nothing db props!!!');
    }

    isInitialize() {
        return UserTracker.instance !== null;
    }

    getSequelize() {
        return UserTracker.sequelize;
    }
    save(actionInfo: ActionInfo) {
        console.log('==================================================');
        return UserTracker.userTraking.create(actionInfo);
    }

    close(){
        if ( UserTracker.sequelize )UserTracker.sequelize.close();
        UserTracker.instance = null;
    }
}

export default UserTracker;