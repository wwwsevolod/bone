import {IAction, IDispatcherFunction} from './Interfaces';

/**
 * Action Creator function interface.
 */
export interface IActionCreator<FunctionType> {
    /**
     * Returns wrapped original function bound to context of dispatcher.
     */
    setDispatcher(dispatcher: IDispatcherFunction): FunctionType;
    dispatcher: IDispatcherFunction;
    type: string;

    /**
     * Returns true if provided action is 'instance of' ActionCreator
     */
    is(action: IAction<any>): boolean;
    bind(thisArg): FunctionType;
}

export interface IFunctionThatReturn<ReturnType, ArgType> {
    (options: ArgType): ReturnType;
}

export type TActionFunction<ActionFunction> = ActionFunction & IActionCreator<ActionFunction>;

/**
 * Creates Action Creator function, that would dispatch result automatically while calling.
 * The only trade-off here made by current state of TypeScript type system is that Action Function must have only one argument
 * to infer type in Reducers (only created by `createReducer`), not less or more.
 * This problem may go off if TypeScript do something for variadic generics.
 */
export function createAction<ActionFunction>(actionType: string, actionCreator: ActionFunction) {
    const actionName = actionType;
    const converted = function(...args) {
        const result = (<any> actionCreator)(...args);
        this.dispatcher({
            type: actionName,
            payload: result
        });
        return result;
    } as any as TActionFunction<ActionFunction>; // Little hack, need better workaround

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
