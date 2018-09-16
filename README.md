# log collector
error log collector

### init database table
use script or sql
```ecmascript 7
import { initTable }  from 'log-collector'
try{ 
    await initTable(testConfig);
} catch (error) {
    console.error(error);
}
```

```sql
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
```

## how to use
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
    }
};
const reportor = await ErrorReporter.getInstance(config); // singleton
const error = {
    type: 'client-error',
    name: 'some error',
    ...
}; // see error format
reportor.procesError(error);
```

express
```javascript

/**
* initialize
*/
let errorReporter;
function initErrorNotice() {
  try {
    const ErrorReporter = errorCatchNotice.default
    const config = {
      dbOn: true,
      slackOn: true,
      dbProperties:conf.errorDB,
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

process.on('exit', function() {
  try {
    errorReporter.close()
  } catch(err) {
    console.log('errorReporter close fail',err);
  }

});
```


## error format
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
```