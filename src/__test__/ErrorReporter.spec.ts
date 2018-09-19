import ErrorReporter from "../ErrorReporter";
import DBTester from './DBTester';

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
test('intialize test', () => {
    expect(errorReporter.isInitialize()).toBe(true);
});

/**
 * 저장 테스트
 */
test('saveError', async () => {
    const before = await dbTester.getCount();
    await errorReporter.saveError(error);
    const after = await dbTester.getCount();
    expect((before + 1)).toBe(after);

    const errorByDb = await dbTester.getLastOne();
    const result = {
        type: errorByDb.get("type"),
        name: errorByDb.get("name"),
        status: errorByDb.get("status"),
    };
    expect(error).toEqual(result);
});

/**
 * 슬랙 테스트
 */
test('slack test', async () => {
    const result = await errorReporter.noticeSlack(error);
    expect(result).toBe(true);
});

test('error report', async () => {
    const before = await dbTester.getCount();
    await errorReporter.procesError(error);
    const after = await dbTester.getCount();
    expect((before + 1)).toBe(after);

    const errorByDb = await dbTester.getLastOne();
    const result = {
        type: errorByDb.get("type"),
        name: errorByDb.get("name"),
        status: errorByDb.get("status"),
    };
    expect(error).toEqual(result);
});