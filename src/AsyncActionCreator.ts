import {IDispatcherFunction, IAsyncAction, TAnyFunction} from './Interfaces';
import {AbstractActionCreator} from './AbstractActionCreator';

export const STATUS_BEGIN = 'begin';
export const STATUS_FAILURE = 'failure';
export const STATUS_SUCCESS = 'success';

export abstract class AsyncActionCreator extends AbstractActionCreator {
    protected wrapDispatch(dispatch: TAnyFunction) {
        return (...args: any[]) => {
            let promise: Promise<any>;
            const actionType = this.getActionType();

            this.dispatcher(<IAsyncAction<{ arguments: any[] }>>{
                type: actionType,
                status: STATUS_BEGIN,
                payload: { arguments: args }
            });

            try {
                promise = dispatch(...args);
            } catch (error) {
                this.dispatcher(<IAsyncAction<Error>>{
                    type: actionType,
                    status: STATUS_FAILURE,
                    error: true,
                    payload: error
                });

                throw error;
            }

            return promise.catch((error) => {
                this.dispatcher(<IAsyncAction<Error>>{
                    type: actionType,
                    status: STATUS_FAILURE,
                    error: true,
                    payload: error
                });

                throw error;
            }).then<any>(<Result>(result: Result) => {
                this.dispatcher(<IAsyncAction<Result>>{
                    type: actionType,
                    status: STATUS_SUCCESS,
                    payload: result
                });

                return result;
            });
        }
    }

    abstract dispatch(...any: any[]): Promise<any>
}
