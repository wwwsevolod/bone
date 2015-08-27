import {IAction} from './Interfaces';
import {InitAction} from './ActionCreator';
import {ActionReducer} from './ActionReducer';

export type TListener = () => void;

export class Context<Shape> {
    private state: Shape;

    private listeners: TListener[] = [];

    private emitChange() {
        this.listeners.forEach(listener => listener());
    }

    private reducer: ActionReducer<Shape>;

    constructor(reducer: ActionReducer<Shape>, middlewares?: any[]) {
        this.reducer = reducer;
        this.init();
    }

    private init() {
        new InitAction(this.getDispatchFunction()).dispatch();
    }

    private dispatch(action: IAction<any>) {
        this.state = this.reducer.reduceAction(action, this.state);
        this.emitChange();
    }

    register(callback: TListener) {
        this.listeners.push(callback);
    }

    unregister(callback: TListener) {
        this.listeners.splice(this.listeners.findIndex((value) => value === callback), 1);
    }

    getState(): Shape {
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

    toJSON() {
        return this.getState();
    }
}


export function createContext<Shape>({getInitialState, setupReducers, middlewares}: {
    getInitialState(): Shape,
    setupReducers?(actionReducer: ActionReducer<Shape>): any,
    middlewares?: any[]
}): () => Context<Shape> {
    return () => {
        const reducer = new ActionReducer<Shape>();
        reducer.on(InitAction, getInitialState);
        if (setupReducers) {
            setupReducers(reducer);
        }
        return new Context<Shape>(reducer, middlewares);
    };
}
