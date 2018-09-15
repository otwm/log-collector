import getDBInstance from "../getDBInstance";

const testConfig = {
    dbProperties:{
        host: 'test.c6uzujan23zf.ap-northeast-2.rds.amazonaws.com',
        dialect: 'mysql',
        username: 'otwm',
        password: 'mypassword',
    },
    slackProperties: {
        url: 'https://hooks.slack.com/services/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',
    }
};

test('getDBInstance test', async () => {
    const sequelize = await getDBInstance(testConfig);
    expect(sequelize).not.toBeNull();
});