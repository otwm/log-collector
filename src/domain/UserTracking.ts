import * as Sequelize from "sequelize";
// import {ErrorInfo} from "../ErrorReporter";
// import {DefineOptions} from "sequelize";

// TODO: field length check
function getUserTraking(sequelize, tableName = 'user_traking') {
    return sequelize.define(tableName, {
        id: {
            primaryKey: true, type: Sequelize.BIGINT,
            autoIncrement: true,
        },
        type: {
            type: Sequelize.STRING(25),
            field: 'error_type',
            defaultValue: 'server_error',
        },
        name: Sequelize.STRING(25),
        message: Sequelize.STRING(50),
        code: Sequelize.STRING(50),
        errno: Sequelize.STRING(50),
        syscall: Sequelize.STRING(50),
        hostname: Sequelize.STRING(50),
        status: Sequelize.INTEGER(3).UNSIGNED,
        statusText: {
            type: Sequelize.STRING(25),
            field: 'status_text',
        },
        reqUrl: {
            type: Sequelize.STRING(300),
            field: 'req_url',
        },
        reqQuery: {
            type: Sequelize.STRING(300),
            field: 'req_query',
        },
        reqBody: {
            type: Sequelize.STRING(300),
            field: 'req_body',
        },
        reqMethod: {
            type: Sequelize.STRING(6),
            field: 'req_method',
        },
        reqStatus: {
            type: Sequelize.INTEGER(3).UNSIGNED,
            field: 'req_status',
        },
        reqResponseData: {
            type: Sequelize.STRING(300),
            field: 'req_res_data',
        },
        userId: {
            type: Sequelize.STRING(25),
            field: 'user_id',
        },
        userName: {
            type: Sequelize.STRING(100),
            field: 'user_name',
        },
        userDepartment: {
            type: Sequelize.STRING(100),
            field: 'user_department',
        },
    },{
        timestamps: true,
        createdAt: 'createTimestamp',
        updatedAt: false,
        charset: 'utf8',
        collate: 'utf8_unicode_ci',
    });
}

export default getUserTraking;