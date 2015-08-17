import {IAction, IDispatcherFunction} from './Interfaces';

type TAnyFunction = (...args: any[]) => any;

/**
 * Action Creator function interface.
 */
export interface IActionCreator<FunctionType extends TAnyFunction> {
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

export type TActionCreatorFunction<ActionFunction extends TAnyFunction> = ActionFunction & IActionCreator<ActionFunction>;

export function createActionCreator<ActionFunction extends TAnyFunction>(actionName: string, func: ActionFunction) {
    var converted = <TActionCreatorFunction<ActionFunction>> func;

    converted.is = (action) => action.type === converted.type;
    converted.type = actionName;

    converted.setDispatcher = (dispatcher: IDispatcherFunction) => {
        return converted.bind({
            dispatcher: dispatcher
        });
    };

    return converted;
}
