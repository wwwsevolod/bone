import {IAction} from './Interfaces';
import {InitAction} from './createAction';
import {IActionCreator, TAnyFunction} from './createActionCreator';

interface IContextOptions<Actions, ReduceState> {
    actions?: Actions,
    reduceState(state: ReduceState, action: IAction<any>): ReduceState,
}

type TListener = () => void;

export abstract class ContextClass<Actions, ReducerState, Parent> {
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

    dispatch(action: IAction<any>) {
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

    private prepareAction<Func extends TAnyFunction>(actionCreatorFunction: IActionCreator<Func>) {
        const dispatch = this.getDispatchFunction();
        return actionCreatorFunction.setDispatcher(dispatch);
    }

    setActions(actions: Actions) {
        Object.keys(actions).forEach((key) => {
            if (actions[key].setDispatcher) {
                actions[key] = this.prepareAction(<IActionCreator<TAnyFunction>> actions[key]);
            }
        });
        this.actions = actions;
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

