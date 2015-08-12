import {Action} from './Action';

interface ReducerFunction<ReducerState> {
    (state: ReducerState, payload: any, action: Action): ReducerState
}

export abstract class Reducer<ReducerState> {
    action: Action;
    actionsMap: Map<any, ReducerFunction<ReducerState>>;

    constructor(action: Action) {
        this.action = action;
        this.actionsMap = new Map<any, ReducerFunction<ReducerState>>();
        this.init();
    }

    protected on(action, reduce: ReducerFunction<ReducerState>) {
        this.actionsMap.set(action, reduce);
    }

    protected abstract init();

    reduce(state: ReducerState): ReducerState {
        const reducerFunction = this.actionsMap.get(this.action.type);
        if (!reducerFunction) {
            return state;
        }

        return reducerFunction(state, this.action.payload, this.action);
    }
}
