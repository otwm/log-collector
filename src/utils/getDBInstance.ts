import * as Sequelize from "sequelize";
import * as iconv from 'iconv-lite';
import * as encodings from 'iconv-lite/encodings';
import { Config } from "../ErrorReporter";
import {defaultOption} from "../common/constants";
import { path } from "ramda";

// @ts-ignore
iconv.encodings = encodings;

async function getDBInstance(config: Config) {
    let sequelize;
    try {
        const dbProperties = path(['dbProperties'], config);
        sequelize = new Sequelize(Object.assign({}, defaultOption, dbProperties));
        await sequelize.authenticate();
        console.log('connected');
        return sequelize;
    } catch(error) {
        console.log(error);
        throw error;
    }
    return null;
}

export default getDBInstance;