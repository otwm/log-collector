import ErrorReporter from './ErrorReporter';
import UserTracker, { Operation } from './UserTracker';
import { initErrorReportTable, initUserTrackingTable } from './utils/initTable';

export default ErrorReporter;

export {
    UserTracker,
    Operation,
    initErrorReportTable,
    initUserTrackingTable,
};