import { initUserTrackingTable, initErrorReportTable } from "../initTable";

// TODO: init table 정보가 잘못됨.
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

test('init error report table', async () => {
    await initErrorReportTable(testConfig);
});

test('init error report table', async () => {
    await initUserTrackingTable(testConfig);
});