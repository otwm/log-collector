// 테이블 크리생성
// 디비 외부 전달
// 사용자 오퍼레이션 저장



import UserTracker from "../UserTracker";
import * as Sequelize from "sequelize";

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

// const sequelize = null;

const configByDbproperties = {
    dbProperties,
    sequalize: null,
};

const configByDbpropertiesFull = {
    dbProperties: dbPropertiesByFull,
    sequalize: null,
};

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