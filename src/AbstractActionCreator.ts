import {IAction, IDispatcherFunction, TAnyFunction} from './Interfaces';

const names = new Set<string>();

export abstract class AbstractActionCreator {
    dispatcher: IDispatcherFunction;

    static is(action: IAction<any>) {
        return action.type === this.getActionType();
    }

    is(action: IAction<any>) {
        return action.type === this.getActionType();
    }

    static getActionType() {
        return <string> this['name'];
    }

    getActionType() {
        return <string>this.constructor['name'];
    }

    constructor(dispatcher: IDispatcherFunction) {
        this.dispatcher = dispatcher;
        this.dispatch = this.wrapDispatch(this.dispatch);
    }

    abstract dispatch(...any: any[]): any;

    protected abstract wrapDispatch(dispatch: TAnyFunction): TAnyFunction;
}
