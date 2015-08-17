import {IDispatcherFunction, IAsyncAction} from './Interfaces';
import {createActionCreator} from './createActionCreator';

export const STATUS_BEGIN = 'begin';
export const STATUS_FAILURE = 'failure';
export const STATUS_SUCCESS = 'success';

export function createAsyncAction<ActionFunction extends { (...args: any[]): Promise<any> }>(actionName: string, actionCreator: ActionFunction) {
    return createActionCreator(actionName, <ActionFunction> function(...args) {
        let promise: Promise<any>;

        this.dispatcher(<IAsyncAction<{ arguments: any[] }>> {
            type: actionName,
            status: STATUS_BEGIN,
            payload: { arguments: args }
        });

        try {
            promise = actionCreator(...args);
        } catch (error) {
            this.dispatcher(<IAsyncAction<Error>> {
                type: actionName,
                status: STATUS_FAILURE,
                error: true,
                payload: error
            });

            throw error;
        }

        return promise.catch((error) => {
            this.dispatcher(<IAsyncAction<Error>> {
                type: actionName,
                status: STATUS_FAILURE,
                error: true,
                payload: error
            });

            throw error;
        }).then<any>(<Result> (result: Result) => {
            this.dispatcher(<IAsyncAction<Result>> {
                type: actionName,
                status: STATUS_SUCCESS,
                payload: result
            });

            return result;
        });
    });
}
