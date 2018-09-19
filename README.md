# log collector
에러 로깅, 사용자 정보 저장.

### init database table
테이블 셋팅이 먼저 필요하다. 두개의 테이블 error_reports와 user_trackings이 필요 하면 아래의 방법으로 만들 수 있다.
테이블 명은 변경이 가능하나, 컬럼은 변경이 불가능하다.
기본 테이블 명은 error_reports, user_trackings

스크립트
```ecmascript 7
import { initTable }  from 'log-collector'

const testConfig = {
    dbProperties:{
        host: 'xxxx',
        dialect: 'mysql',
        username: 'xxxx',
        password: 'xxxx',
    },
    slackProperties: {
        url: 'xxxx',
    },
    slackOn: true,
    dbOn: true,
};

try{ 
    await initTable(testConfig);
    await initUserTrackingTable(testConfig, 'some table name'); // 테이블 네임
} catch (error) {
    console.error(error);
}
```
spec: /src/utils/__test__/initTable.spec.ts

sql
```sql
-- auto-generated definition
create table error_reports
(
  id              bigint auto_increment
    primary key,
  error_type      varchar(25) default 'server_error' null,
  name            varchar(25)                        null,
  message         varchar(50)                        null,
  code            varchar(50)                        null,
  errno           varchar(50)                        null,
  syscall         varchar(50)                        null,
  hostname        varchar(50)                        null,
  status          int(3) unsigned                    null,
  status_text     varchar(25)                        null,
  req_url         varchar(300)                       null,
  req_query       varchar(300)                       null,
  req_body        varchar(300)                       null,
  req_method      varchar(6)                         null,
  req_status      int(3) unsigned                    null,
  req_res_data    varchar(300)                       null,
  user_id         varchar(25)                        null,
  user_name       varchar(100)                       null,
  user_department varchar(100)                       null,
  createTimestamp datetime                           not null
)
  collate = utf8_unicode_ci;

-- auto-generated definition
create table user_trakings
(
  id              bigint auto_increment
    primary key,
  display_name    varchar(100)    null,
  action_name     varchar(50)     null,
  operation       int(1) unsigned null,
  params          json            null,
  createTimestamp datetime        not null
)
  collate = utf8_unicode_ci;

```

## how to use
### error report
초기화 과정 필요. 이후 에러 리포팅.

es7 초기화
```ecmascript 7
import ErrorReportor from 'log-collector'

const config = {
    slackOn: true,
    dbOn: true,
    dbProperties:{ // db info
        host: 'db host',
        dialect: 'mysql', // only mysql support
        username: 'xxx',
        password: 'xxx',
        
    },
    slackProperties: { // slack info
        url: 'webhook url',
    },
    
};
const reportor = await ErrorReporter.getInstance(config); // singleton
const error = {
    type: 'client-error',
    name: 'some error',
    ...
}; // see error format
reportor.procesError(error);
```

es5 - express
```javascript


/**
* initialize - props
*/
let errorReporter;
function initErrorNotice() {
  try {
    const ErrorReporter = errorCatchNotice.default
    const config = {
      dbOn: true,
      slackOn: true,
      dbProperties:{
        host: 'xxxxxx',
        dialect: 'mysql',
        username: 'xxx',
        password: 'xxx',
      },
      slackProperties: {
        url: conf.slack.url,
      }
    };
    ErrorReporter.getInstance(config).then(instance => {
      errorReporter = instance
    })
  } catch (error) {
    console.error(`error initErrorNotice!!! ${error}`);
  }
}

initErrorNotice();

/**
* initialize - sequalize
*/
let errorReporter;
function initErrorNotice() {
  try {
    const ErrorReporter = errorCatchNotice.default
    const config = {
      dbOn: true,
      slackOn: true,
      slackProperties: {
        url: conf.slack.url,
      },
      sequelize: sequelize, // sequelize 인스턴스
    };
    ErrorReporter.getInstance(config).then(instance => {
      errorReporter = instance
    })
  } catch (error) {
    console.error(`error initErrorNotice!!! ${error}`);
  }
}
```

주요 config instance
```typescript
export interface SlackProperties {
    url: string;
}

export interface Config {
    dbOn: boolean;
    slackOn: boolean;
    dbProperties?: object;
    sequelize?: any;
    slackProperties?: SlackProperties;
    tableName?: string;
}
```

에러 리포트
``` javascript
/**
* error handle
*/
app.use(function(err, req, res, next) {
  try {
    //...
    const errorInfo = {
      type: 'server-error',
      name, message, code, status, errno, syscall, hostname,
      reqInfo: {
        url, query, body, method, status, responseData: data
      },
      user: {
        id: adminId,
        name: adminName,
        department
      }
    }
    errorReporter.procesError(errorInfo).then(()=>{
    }).catch(error4Send => {
      console.log(error4Send)
    });
    res.status(status).json(errorInfo)
  } catch(e) {
    res.status(500).json(e)
  }
});
```

``` javascript
process.on('exit', function() {
  try {
    errorReporter.close() // 인스턴스를 없애고 , 시퀄라이즈 클로즈
  } catch(err) {
    console.log('errorReporter close fail',err);
  }

});
```

주요 ErrorInfo instance
```typescript
export interface User {
    id?: string;
    name?: string
    department?: string;
}

export interface ErrorInfo {
    type: string;
    name?: string;
    message?: string;
    code?: string;
    errno?: string;
    syscall?: string;
    hostname?: string;
    status: number;
    statusText?: string;
    reqInfo?: RequestInfo;
    user?: User;
}

export interface RequestInfo {
    url: string;
    query?: object;
    body?: object;
    method: string;
    status: number;
    responseData?: string;
}

export interface User {
    id?: string;
    name?: string
    department?: string;
}
```
cf: src/__test__/ErrorReporter.spec.ts
cf: src/__test__/ErrorReporter.dbOff.spec.ts

메서드
```
async procesError( error ); // 에러 처리
getSequalize(); // 시퀄라이즈 얻기
isInitialize() // 초기화 확인 - 크게 의미는 없음 . 테스트용으로 제작
```

### user tracking
초기화
```
test.skip('initialize db - by sequalize', async () => {
    const sequelize = new Sequelize(dbProperties);
    const userTracker = await UserTracker.getInstance({
        sequelize,
    });
    expect(userTracker.isInitialize()).toBe(true);

    userTracker.close();
});
```

유저 트랙킹
```
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
```

주요 interface 
```typescript
/**
 * 사용자 오퍼레이션 - javascript 의 경우 순서대로 insert=>1,update=>2,delete=>3,select=>4,merge=>5
 */
export enum Operation {
    Insert = 1,
    Update,
    Delete,
    Select,
    Merge,
}

/**
 * 액션
 */
export interface ActionInfo {
    displayName?: string, //화면명
    actionName: string, // 액션 명
    operation: Operation, // 수행 오퍼레이션
    params?: object, // 파라미터
}

export interface UserTrackerConfig {
    dbProperties?: object;
    sequelize?: any; 
    saveReconnect?: boolean;
    tableName?: string;
}
```

메서드
```
async procesError( error ); // 에러 처리
getSequalize(); // 시퀄라이즈 얻기
isInitialize() // 초기화 확인 - 크게 의미는 없음 . 테스트용으로 제작
```
cf: src/__test__/UserTracking.spec.ts
