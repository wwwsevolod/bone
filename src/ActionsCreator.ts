import {Action} from './Action';

const notActionMethods = new Set(['constructor', 'convertActions', 'performActions']);

interface DispatchInterface {
    (action: Action): void;
}

interface Dispatcher {
    dispatch: DispatchInterface
}

export class ActionsCreator {
    private dispatcher: Dispatcher;
    
    constructor(dispatcher: Dispatcher) {
        this.dispatcher = dispatcher;
        this.convertMethodsToActions();
    }

    private convertMethodsToActions() {
        Object.getOwnPropertyNames(this.constructor.prototype).forEach((actionName) => {
            const action = this[actionName];
            if (typeof action !== 'function') {
                return;
            }

            if (notActionMethods.has(actionName)) {
                return;
            }

            this[actionName] = (...args) => this.performAction(actionName, action, args);
        });
    }

    private getName(): string {
        return this.constructor['name'];
    }

    private performAction(actionName: string, actionFunc: (...args) => any, args: any[]) {
        const actionNameComputed = `${this.getName()}:${actionName}`;

        this.dispatcher.dispatch({
            type: `${actionNameComputed}:begin`,
            error: false,
            payload: args,
            meta: null
        });

        let result;

        try {
            result = actionFunc(...args);
        } catch (err) {
            this.dispatcher.dispatch({
                type: `${actionNameComputed}:failure`,
                error: true,
                payload: err,
                meta: null
            });
            return;
        }

        if (result && (result instanceof Promise || typeof result.then === 'function')) {
            return result.catch(err => {
                this.dispatcher.dispatch({
                    type: `${actionNameComputed}:failure`,
                    error: true,
                    payload: err,
                    meta: null
                });

                throw err;
            }).then(result => {
                this.dispatcher.dispatch({
                    type: `${actionNameComputed}:success`,
                    error: false,
                    payload: result,
                    meta: null
                });

                return result;
            });
        } else {
            this.dispatcher.dispatch({
                type: `${actionNameComputed}:success`,
                error: false,
                payload: result,
                meta: null
            });
        }

        return result;
    }
}
