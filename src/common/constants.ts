const defaultOption = {
    pool: {
        max: 5,
        min: 1,
        acquire: 20000,
        idle: 20000,
    },
    retry: {
        max: 2,
    },
    dialect: 'mysql',
    port: 3306,
    define: {
        charset: 'utf8',
        collate: 'utf8_general_ci',
        timestamps: true
    },
    database: 'innodb',
    operatorsAliases: false,
    sync: { force: false },
};

export {
    defaultOption,
};