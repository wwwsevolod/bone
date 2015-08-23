import {InitAction} from './ActionCreator';
import {AbstractActionCreator} from './AbstractActionCreator';
import {IAction, IAsyncAction, IDispatcherFunction, TAnyFunction} from './Interfaces';
import {STATUS_BEGIN, STATUS_FAILURE, STATUS_SUCCESS} from './AsyncActionCreator';

export interface IFunctionThatReturn<ReturnType, ArgType> {
    (options: ArgType): ReturnType;
}

export interface IBeginActionPayload {
    arguments: any[]
}

export interface IActionCreatorClass<ActionFunction extends TAnyFunction> {
    new (dispatcher: IDispatcherFunction): AbstractActionCreator;
    prototype: {
        dispatch: ActionFunction
    };
    getActionType(): string;
}

export type TReducerFunction<State, P> = (state: State, payload: P, action: IAction<P>) => State;

export interface IReducer<State> {
    (state: State, action: IAction<any>): State
    on<ReturnType, ArgType>(actionClass: IActionCreatorClass<IFunctionThatReturn<ReturnType, ArgType>>, reduce: (state: State, payload: ReturnType, action: IAction<ReturnType>) => State): IReducer<State>;
    onAsync<PromiseType, ArgType>(
        actionClass: IActionCreatorClass<IFunctionThatReturn<Promise<PromiseType>, ArgType>>,
        reduceSuccess: TReducerFunction<State, PromiseType>,
        reduceFailure?: TReducerFunction<State, Error>,
        reduceBegin?: TReducerFunction<State, IBeginActionPayload>
    ): IReducer<State>;
}

export function createReducer<State>(onInit: () => State) {
    const actionsMap = new Map<any, TReducerFunction<State, any>>();

    const reducer = <IReducer<State>> ((state: State, action: IAction<any>|IAsyncAction<any>) => {
        const reduceHandler = actionsMap.get(action.type);

        if (!reduceHandler) {
            return state;
        }

        return reduceHandler(state, action.payload, action);
    });

    reducer.on = <ReturnType, ArgType>(
        actionClass: IActionCreatorClass<IFunctionThatReturn<ReturnType, ArgType>>,
        reduce: TReducerFunction<State, ReturnType>
    ) => {
        actionsMap.set(actionClass.getActionType(), reduce);
        return reducer;
    };

    reducer.onAsync = <PromiseType, ArgType>(
        actionClass: IActionCreatorClass<IFunctionThatReturn<Promise<PromiseType>, ArgType>>,
        reduceSuccess: TReducerFunction<State, PromiseType>,
        reduceFailure?: TReducerFunction<State, Error>,
        reduceBegin?: TReducerFunction<State, { arguments: any[] }>
    ) => reducer.on(actionClass, (state: State, payload: any, action: IAsyncAction<PromiseType|Error|{ arguments: any[] }>) => {
        if (action.status === STATUS_BEGIN) {
            if (reduceBegin) {
                return reduceBegin(state, payload, <IAsyncAction<{ arguments: any[] }>> action);
            }
        } else if (action.status === STATUS_FAILURE) {
            if (reduceFailure) {
                return reduceFailure(state, payload, <IAsyncAction<Error>> action);
            }
        } else if (action.status === STATUS_SUCCESS) {
            return reduceSuccess(state, payload, <IAsyncAction<PromiseType>> action);
        }

        return state;
    });

    return reducer.on(InitAction, onInit);
};
