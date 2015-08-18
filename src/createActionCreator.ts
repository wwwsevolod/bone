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
    bind<This extends {dispatcher: IDispatcherFunction}>(thisArg: This): FunctionType;
}

const names = new Set<string>();

export type TActionCreatorFunction<ActionFunction extends TAnyFunction> = ActionFunction & IActionCreator<ActionFunction>;

export function createActionCreator<ActionFunction extends TAnyFunction>(actionName: string, func: ActionFunction) {
    const converted = <TActionCreatorFunction<ActionFunction>> func;

    if (true) {// TODO: use process.env for dev\test\prod.
        if (names.has(actionName)) {
            console.warn(`You have declared more than one action named '${actionName}', be careful.`);
        } else {
            names.add(actionName);
        }
    }

    converted.is = (action: IAction<any>) => action.type === converted.type;
    converted.type = actionName;

    converted.setDispatcher = (dispatcher: IDispatcherFunction) => {
        return converted.bind({dispatcher});
    };

    return converted;
}
