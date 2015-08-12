import {Action} from './Action';
import {ActionsCreator} from './ActionsCreator';
import {ObjectSerializable} from './Serializable';

declare var process: any;

export interface ContextState {}

export abstract class Context<State extends ContextState> {
    state: State;
    actions: Object;

    constructor(noInitState = false) {
        if (!noInitState) {
            this.init();
        }
    }

    protected init() {
        this.state = this.computeState({} as State, {type: 'init', payload: {}});
        // this.prepareActions();
    }

    protected abstract computeState(previousState: State, action: Action): State;

    dispatch(action: Action) {
        this.state = this.computeState(this.state, action);
    }
}

export abstract class ChildContext<State extends ContextState, Parent extends Context<any>> extends Context<State> {
    protected parent: Parent;

    constructor(parentContext: Parent, noInitState = false) {
        super(true);
        this.parent = parentContext;
        if (!noInitState) {
            this.init();
        }
    }
}
