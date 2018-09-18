import UserTracker, {Operation} from "../UserTracker";
import * as Sequelize from "sequelize";
import DBTester from "./DBTester";

const dbProperties = {
    host: 'test.c6uzujan23zf.ap-northeast-2.rds.amazonaws.com',
    dialect: 'mysql',
    username: 'otwm',
    password: 'mypassword',
};

const dbPropertiesByFull = {
    host: 'test.c6uzujan23zf.ap-northeast-2.rds.amazonaws.com',
    dialect: 'mysql',
    username: 'otwm',
    password: 'mypassword',
    pool: {
        max: 10,
        min: 1,
        acquire: 20000,
        idle: 20000,
    },
    retry: { max: 2 },
};

const testConfig = {
    dbProperties:{
        host: 'test.c6uzujan23zf.ap-northeast-2.rds.amazonaws.com',
        dialect: 'mysql',
        username: 'otwm',
        password: 'mypassword',
    },
    slackProperties: {
        url: 'https://hooks.slack.com/services/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',
    },
    slackOn: true,
    dbOn: true,
};
// const sequelize = null;

const configByDbproperties = {
    dbProperties,
    sequalize: null,
};

const configByDbpropertiesFull = {
    dbProperties: dbPropertiesByFull,
    sequalize: null,
};

let dbTester = null;
beforeEach(async () => {
    dbTester = await DBTester.getInstance(testConfig);
});

test.skip('initialize db', async () => {
    const userTracker = await UserTracker.getInstance(configByDbproperties);
    expect(userTracker.isInitialize()).toBe(true);

    const userTrackerFull = await UserTracker.getInstance(configByDbpropertiesFull);
    expect(userTrackerFull.isInitialize()).toBe(true);

    userTracker.close();
    userTrackerFull.close();
});

test.skip('initialize db - by sequalize', async () => {
    const sequelize = new Sequelize(dbProperties);
    const userTracker = await UserTracker.getInstance({
        sequelize,
    });
    expect(userTracker.isInitialize()).toBe(true);

    userTracker.close();
});

test('save user tracking', async () => {
    const userTracker = await UserTracker.getInstance(configByDbproperties);
    console.log(dbTester);
    const before = await dbTester.getCount4UserTraking();
    await userTracker.save({
        displayName: 'test1',
        actionName: 'action1',
        operation: Operation.Insert,
        params: { param1: 'p1', param2: 'p2' },
    });
    await userTracker.save({
        displayName: 'test1',
        actionName: 'action1',
        operation: Operation.Delete,
        params: { param1: 'bb', param2: 'ab' },
    });
    await userTracker.save({
        displayName: 'test1',
        actionName: 'action1',
        operation: Operation.Update,
        params: { param1: 'temp', param2: 'ok' },
    });
    const after = await dbTester.getCount4UserTraking();
    expect((before + 3)).toBe(after);

});