import * as Sequelize from "sequelize";

// TODO: field length check
function getUserTraking(sequelize, tableName = 'user_traking') {
    return sequelize.define(tableName, {
        id: {
            primaryKey: true, type: Sequelize.BIGINT,
            autoIncrement: true,
        },
        displayName: {
            type: Sequelize.STRING(100),
            field: 'display_name',
        },
        actionName: {
            type: Sequelize.STRING(50),
            field: 'action_name',
        },
        operation: {
            type: Sequelize.INTEGER(1).UNSIGNED,
            field: 'operation',
        },
        params: {
            type: Sequelize.JSON,
            field: 'params',
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