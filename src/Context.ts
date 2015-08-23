import {IAction} from './Interfaces';
import {InitAction} from './ActionCreator';

export type TListener = () => void;

export abstract class Context<ReducerState> {
    protected state = <ReducerState> {};
    private listeners: TListener[] = [];

    private emitChange() {
        this.listeners.forEach(listener => listener());
    }

    constructor() {
        this.init();
    }

    protected init() {}

    private reducer: (state: ReducerState, action: IAction<any>) => ReducerState;

    protected setReducer(reducer: (state: ReducerState, action: IAction<any>) => ReducerState) {
        this.reducer = reducer;
        new InitAction(this.getDispatchFunction()).dispatch();
    }

    private dispatch(action: IAction<any>) {
        this.state = this.reducer(this.state, action);
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
