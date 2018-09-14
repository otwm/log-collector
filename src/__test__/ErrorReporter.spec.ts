import ErrorReporter from "../ErrorReporter";
import DBTester from './DBTester';

// function getLastError() {
//     return {};
// }

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

test('intialize test', () => {
    expect(errorReporter.isInitialize()).toBe(true);
});

test('saveError', () => {
    const error = {};
    errorReporter.saveError({});
    const errorByDb = dbTester.getLastOne();
    expect(error).toEqual(errorByDb);
});

// import * as Sequelize from 'sequelize';
// import * as iconv from 'iconv-lite';
// import encodings from 'iconv-lite/encodings';
// iconv.en = encodings;