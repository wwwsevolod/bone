import {IAction, IDispatcherFunction, TAnyFunction} from './Interfaces';
import {AbstractActionCreator} from './AbstractActionCreator';


export abstract class ActionCreator extends AbstractActionCreator {
    protected wrapDispatch(dispatch: TAnyFunction) {
        return (...args: any[]) => {
            const result = dispatch(...args);
            this.dispatcher({
                type: this.getActionType(),
                payload: result
            });
            return result;
        };
    }
}

/**
 * Action Creator that would run every time instance of Context is created.
 */
export class InitAction extends ActionCreator {
    dispatch() {}
}
