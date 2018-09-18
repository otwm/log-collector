import * as Sequelize from 'sequelize';
import { path } from "ramda";

enum Operation {
    Insert = 1,
    Update,
    Delete,
    Select,
    Merge,
}

interface ActionInfo {
    displayName?: string,
    actionName: string,
    operation: Operation,
    params: string,
}

interface UserTrackerConfig {
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
    operatorsAliases: false,
    sync: { force: false },
};

class UserTracker {
    private static instance = null;
    private static sequelize;
    // private static userTraking: any;

    private constructor() {
    }

    static async getInstance(config: UserTrackerConfig) {
        const sequelize = path(['sequelize'], config);
        const dbProperties = path(['dbProperties'], config);
        if ( sequelize ) {
            UserTracker.sequelize = sequelize;
            UserTracker.instance = new this();
            return UserTracker.instance;
        }
        if ( dbProperties ) {
            UserTracker.sequelize = new Sequelize(Object.assign({}, defaultOption, dbProperties));
            UserTracker.instance = new this();
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
        console.log(UserTracker.sequelize, actionInfo);
    }

    close(){

    }
}

export default UserTracker;