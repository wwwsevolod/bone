import {IAction, IDispatcherFunction} from './Interfaces';

/**
 * Action Creator function interface.
 */
export interface IActionCreator<FunctionType> {
    /**
     * Returns wrapped original function bound to context of dispatcher.
     */
    setDispatcher(dispatcher: IDispatcherFunction): FunctionType;
    type: string;

    /**
     * Returns true if provided action is 'instance of' ActionCreator
     */
    is(action: IAction<any>): boolean;
    bind(thisArg): FunctionType;
}

export type TActionFunction<ActionFunction> = ActionFunction & IActionCreator<ActionFunction>;

/**
 * Creates Action Creator function, that would dispatch result automatically while calling.
 */
export function createAction<ActionFunction extends { (...args: any[]): any }>(actionType: string, actionCreator: ActionFunction) {
    const actionName = actionType;
    const converted = function(...args) {
        const result = actionCreator(...args);
        this.dispatcher({
            type: actionName,
            payload: result
        });
        return result;
    } as TActionFunction<ActionFunction>;

    converted.is = (action) => action.type === converted.type;
    converted.type = actionName;

    converted.setDispatcher = (dispatcher: IDispatcherFunction) => {
        return converted.bind({
            dispatcher: dispatcher
        });
    };

    return converted;
}

/**
 * Action Creator that would run every time instance of Context is created.
 */
export const InitAction = createAction('INIT', () => null);

