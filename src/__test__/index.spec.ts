class ErrorReporter {
    constructor( config ) {
    }

    saveError( error ){

    }

    noticeSlack( error ) {

    }

    procesError( error ) {
        this.saveError(error);
        this.procesError(error);
    }

    close(){

    }
}

function getLastError() {
    return {};
}

let errorReporter = null;

beforeEach(() => {
    errorReporter = new ErrorReporter({});
});

afterEach(() => {
    errorReporter.close();
});


test('saveError', () => {
    const error = {};
    errorReporter.saveError({});
    const errorByDb = getLastError();
    expect(error).toEqual(errorByDb);
});