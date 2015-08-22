import {IAction} from './Interfaces';
import {InitAction} from './createAction';

interface IContextOptions<Actions, ReduceState> {
    actions?: Actions,
    reduceState(state: ReduceState, action: IAction<any>): ReduceState,
}

type TListener = () => void;

export abstract class ContextClass<ReducerState> {
    private state = {} as ReducerState;
    private listeners: TListener[] = []

    private emitChange() {
        this.listeners.forEach(listener => listener());
    }

    protected abstract reduceState(state: ReducerState, action: IAction<any>): ReducerState;

    private dispatch(action: IAction<any>) {
        this.state = this.reduceState(this.state, action);
        this.emitChange();
    }

    register(callback: TListener) {
        this.listeners.push(callback)
    }

    unregister(callback: TListener) {
        this.listeners.splice(this.listeners.findIndex((value) => value === callback), 1);
    }

    getState(): ReducerState {
        return this.state;
    }

    getDispatchFunction() {
        return (action: IAction<any>) => this.dispatch(action);
    }

    destructor() {
        this.state = null;
        this.listeners = null;
    }

    serialize() {
        return JSON.stringify(this);
    }

    hydrate(state: ReducerState) {
        this.state = state;
        this.emitChange();
    }

    toJSON() {
        return this.getState();
    }
}

export function createContext<Actions, ReducerState>(options: IContextOptions<Actions, ReducerState>) {
    return class GeneratedContext extends ContextClass<ReducerState> {
        constructor() {
            super();
            new InitAction(this.getDispatchFunction()).dispatch();
        }

        protected reduceState(state: ReducerState, action: IAction<any>): ReducerState {
            return options.reduceState(state, action);
        }
    }
}

