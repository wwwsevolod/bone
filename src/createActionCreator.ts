import {IAction, IDispatcherFunction, TAnyFunction} from './Interfaces';

const names = new Set<string>();

export abstract class ActionCreator<FunctionType extends TAnyFunction> {
    static type: string;
    type: string;
    dispatcher: IDispatcherFunction;

    constructor(dispatcher: IDispatcherFunction) {
        this.dispatcher = dispatcher;
    }

    is(action: IAction<any>) {
        return action.type === this.type;
    }

    static is(action: IAction<any>) {
        return action.type === this.type;
    }


    dispatch: FunctionType;
    static __dispatch: TAnyFunction;
}

export function createActionCreator<ActionFunction extends TAnyFunction>(actionName: string, func: ActionFunction) {
    if (false) {// TODO: use process.env for dev\test\prod.
        if (names.has(actionName)) {
            console.warn(`You have declared more than one action named '${actionName}', be careful.`);
        } else {
            names.add(actionName);
        }
    }


    class GeneratedActionCreator extends ActionCreator<ActionFunction> {
        static type = actionName;
        type = actionName;
        dispatch: ActionFunction = func;

        // For type inference purposes
        static __dispatch: ActionFunction = func;
    }

    return GeneratedActionCreator;
}

const Asd = createActionCreator('asd', () => {
    return 123;
});

Asd.__dispatch
