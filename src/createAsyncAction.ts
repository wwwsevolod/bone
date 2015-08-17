import {IActionCreator} from './createAction';
import {IDispatcherFunction, IAsyncAction} from './Interfaces';

export interface IAsyncActionCreator<FunctionType> extends IActionCreator<FunctionType> {

}

export type TAsyncActionFunction<ActionFunction> = ActionFunction & IAsyncActionCreator<ActionFunction>;

export const STATUS_BEGIN = 'begin';
export const STATUS_FAILURE = 'failure';
export const STATUS_SUCCESS = 'success';

export function createAsyncAction<ActionFunction extends { (...args: any[]): Promise<any> }>(actionType: string, actionCreator: ActionFunction) {
    const actionName = actionType;
    const converted = <TAsyncActionFunction<ActionFunction>> function(...args) {
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
        }).then<any>((result: any) => {
            this.dispatcher(<IAsyncAction<any>> {
                type: actionName,
                status: STATUS_SUCCESS,
                payload: result
            });

            return result;
        });
    };

    converted.is = (action) => action.type === converted.type;
    converted.type = actionName;

    converted.setDispatcher = (dispatcher: IDispatcherFunction) => {
        return converted.bind({
            dispatcher: dispatcher
        });
    };

    return converted;
}
