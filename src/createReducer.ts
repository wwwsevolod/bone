import {InitAction} from './createAction';
import {ActionCreator} from './createActionCreator';
import {IAction, IAsyncAction, IDispatcherFunction, TAnyFunction} from './Interfaces';
import {STATUS_BEGIN, STATUS_FAILURE, STATUS_SUCCESS} from './createAsyncAction';

export interface IFunctionThatReturn<ReturnType, ArgType> {
    (options: ArgType): ReturnType;
}

interface IBeginActionPayload {
    arguments: any[]
}

interface ActionCreatorClass<ActionFunction extends TAnyFunction> {
    new (dispatcher: IDispatcherFunction): ActionCreator<ActionFunction>;
    __dispatch: ActionFunction;
    type: string;
}

type TAsyncAction<PromiseType, ArgType> = ActionCreatorClass<IFunctionThatReturn<Promise<PromiseType>, ArgType>>;
type TReducerFunction<State, P> = (state: State, payload: P, action: IAction<P>) => State;

export function createReducer<State>(onInit: () => State) {
    interface IReducer<State> {
        (state: State, action: IAction<any>): State
        on<ReturnType, ArgType>(actionClass: ActionCreatorClass<IFunctionThatReturn<ReturnType, ArgType>>, reduce: (state: State, payload: ReturnType, action: IAction<ReturnType>) => State): IReducer<State>;
        onAsync<ReturnType, ArgType>(
            actionClass: TAsyncAction<ReturnType, ArgType>,
            reduceSuccess: TReducerFunction<State, ReturnType>,
            reduceFailure?: TReducerFunction<State, Error>,
            reduceBegin?: TReducerFunction<State, IBeginActionPayload>
        ): IReducer<State>;
    }

    const actionsMap = new Map<any, TReducerFunction<State, any>>();

    const reducer = <IReducer<State>> ((state: State, action: IAction<any>|IAsyncAction<any>) => {
        const reduceHandler = actionsMap.get(action.type);

        if (!reduceHandler) {
            return state;
        }

        return reduceHandler(state, action.payload, action);
    });

    reducer.on = <ReturnType, ArgType>(
        actionClass: ActionCreatorClass<IFunctionThatReturn<ReturnType, ArgType>>,
        reduce: TReducerFunction<State, ReturnType>
    ) => {
        actionsMap.set(actionClass.type, reduce);
        return reducer;
    };

    reducer.onAsync = <PromiseType, ArgType>(
        actionClass: TAsyncAction<PromiseType, ArgType>,
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
