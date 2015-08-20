import {IAction} from './Interfaces';
import {InitAction} from './createAction';
import {IActionCreator, TAnyFunction} from './createActionCreator';

interface IContextOptions<Actions, ReduceState> {
    actions?: Actions,
    reduceState(state: ReduceState, action: IAction<any>): ReduceState,
}

type TListener = () => void;

export abstract class ContextClass<Actions extends {[key:string]: any}, ReducerState, Parent> {
    actions: Actions;

    private state = {} as ReducerState;
    private parent: Parent;
    private childs: ContextClass<any, any, any>[] = [];
    private listeners: TListener[] = []

    private emitChange() {
        this.listeners.forEach(listener => listener());
    }

    protected abstract reduceState(state: ReducerState, action: IAction<any>): ReducerState;

    setParent(parent: Parent) {
        this.parent = parent;
    }

    addChild(child: ContextClass<any, any, any>) {
        this.childs.push(child);
    }

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

    private bindAction<Func extends TAnyFunction>(actionCreatorFunction: IActionCreator<Func>) {
        return actionCreatorFunction.setDispatcher(this.getDispatchFunction());
    }

    private bindActions(actions: Actions) {
        return Object.keys(actions).reduce((accum: any, key: string) => {
            if (actions[key].setDispatcher) {
                accum[key] = this.bindAction(<IActionCreator<TAnyFunction>> actions[key]);
            } else if (typeof actions[key] === 'object') {
                accum[key] = this.bindActions(actions[key])
            }
            return accum;
        }, {});
    }

    protected setActions(actions: Actions) {
        this.actions = this.bindActions(actions);
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
    return class GeneratedContext<Parent> extends ContextClass<Actions, ReducerState, Parent> {
        constructor(parent?: Parent) {
            super();

            this.setActions(options.actions);
            this.setParent(parent);

            InitAction.setDispatcher(this.getDispatchFunction())();
        }

        protected reduceState(state: ReducerState, action: IAction<any>): ReducerState {
            return options.reduceState(state, action);
        }
    }
}

