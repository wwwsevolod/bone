import {IAction, IDispatcherFunction} from './Interfaces';
import {createActionCreator} from './createActionCreator';
/**
 * Creates Action Creator function, that would dispatch result automatically while calling.
 */
export function createAction<ActionFunction extends { (...args: any[]): any }>(actionName: string, actionCreator: ActionFunction) {
    return createActionCreator(actionName, <ActionFunction> function(...args) {
        const result = actionCreator(...args);
        this.dispatcher({
            type: actionName,
            payload: result
        });
        return result;
    });
}

/**
 * Action Creator that would run every time instance of Context is created.
 */
export const InitAction = createAction('INIT', () => null);

