import ErrorReporter from "../ErrorReporter";
import DBTester from './DBTester';
// import initTable from "../utils/initTable";

const testConfig = {
    slackOn: true,
    dbOn: false,
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

const error = {
    type: 'server-error',
    name: '한글 테스트',
    status: 500,
};

let errorReporter = null;
let dbTester = null;

beforeEach(async () => {
    errorReporter = await ErrorReporter.getInstance(testConfig);
    dbTester = await DBTester.getInstance(testConfig);
});

afterEach(() => {
    errorReporter.close();
    dbTester.close();
});

/**
 * 초기화 테스트
 */
test('dbOff-intialize test', () => {
    expect(errorReporter.isInitialize()).toBe(true);
});

// test('init table', async () => {
//     await initTable(testConfig);
// });

/**
 * 저장 테스트
 */
test('dbOff-saveError', async () => {
    const after = await dbTester.getCount();
    console.log(after);
});

/**
 * 슬랙 테스트
 */
test('dbOff-slack test', async () => {
    const result = await errorReporter.noticeSlack(error);
    expect(result).toBe(true);
});

test('error report', async () => {
    await errorReporter.procesError(error);
});