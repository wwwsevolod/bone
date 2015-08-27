import {AbstractActionCreator} from './AbstractActionCreator';
import {IAction, IAsyncAction, IDispatcherFunction, TAnyFunction} from './Interfaces';
import {STATUS_BEGIN, STATUS_FAILURE, STATUS_SUCCESS} from './AsyncActionCreator';

export interface IFunctionThatReturn<ReturnType, ArgType> {
    (options: ArgType): ReturnType;
}

export interface IBeginActionPayload {
    arguments: any[]
}

export type TReducerFunction<State, P> = (state: State, payload: P, action: IAction<P>) => State;

export interface IActionCreatorClass<ActionFunction extends TAnyFunction> {
    new (dispatcher: IDispatcherFunction): AbstractActionCreator;
    prototype: {
        dispatch: ActionFunction
    };
    getActionType(): string;
}

export class ActionReducer<Shape> {
    constructor() {
        this.actionsMap = new Map();
    }

    private actionsMap: Map<any, TReducerFunction<Shape, any>>;

    on<ReturnType, ArgType>(
        actionClass: IActionCreatorClass<IFunctionThatReturn<ReturnType, ArgType>>,
        reduce: TReducerFunction<Shape, ReturnType>
    ) {
        this.actionsMap.set(actionClass.getActionType(), reduce);
    };

    onAsync<PromiseType, ArgType>(
        actionClass: IActionCreatorClass<IFunctionThatReturn<Promise<PromiseType>, ArgType>>,
        reduceSuccess: TReducerFunction<Shape, PromiseType>,
        reduceFailure?: TReducerFunction<Shape, Error>,
        reduceBegin?: TReducerFunction<Shape, { arguments: any[] }>
    ) {
        return this.on(actionClass, (state: Shape, payload: any, action: IAsyncAction<PromiseType|Error|{ arguments: any[] }>) => {
            if (action.status === STATUS_BEGIN) {
                if (reduceBegin) {
                    return reduceBegin(state, payload, <IAsyncAction<{ arguments: any[] }>>action);
                }
            } else if (action.status === STATUS_FAILURE) {
                if (reduceFailure) {
                    return reduceFailure(state, payload, <IAsyncAction<Error>>action);
                }
            } else if (action.status === STATUS_SUCCESS) {
                return reduceSuccess(state, payload, <IAsyncAction<PromiseType>>action);
            }

            return state;
        });
    }

    reduceAction(action: IAction<any>, state: Shape): Shape {
        const reducer = this.actionsMap.get(action.type);

        if (!reducer) {
            return state;
        }

        return reducer(state, action.payload, action);
    }
}
