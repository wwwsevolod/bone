import {InitAction} from './createAction';
import {IActionCreator, TActionCreatorFunction} from './createActionCreator';
import {IAction, IAsyncAction} from './Interfaces';
import {STATUS_BEGIN, STATUS_FAILURE, STATUS_SUCCESS} from './createAsyncAction';

export interface IFunctionThatReturn<ReturnType, ArgType> {
    (options: ArgType): ReturnType;
}

export function createReducer<State>(onInit: () => State) {
    interface IReducer<State> {
        (state: State, action: IAction<any>): State
        on<ReturnType, ArgType>(action: TActionCreatorFunction<IFunctionThatReturn<ReturnType, ArgType>>, reduce: (state: State, payload: ReturnType, action: IAction<ReturnType>) => State): IReducer<State>;
        onAsync<ReturnType, ArgType>(
            action: TAsyncAction<ReturnType, ArgType>,
            reduceSuccess: TReducerFunction<ReturnType>,
            reduceFailure?: TReducerFunction<Error>,
            reduceBegin?: TReducerFunction<{ arguments: any[] }>
        ): IReducer<State>;
    }

    type TReducerFunction<P> = (state: State, payload: P, action: IAction<P>) => State;
    type TActionMapValue = TReducerFunction<any>;

    const actionsMap = new Map<any, TActionMapValue>();

    const reducer = <IReducer<State>> ((state: State, action: IAction<any>|IAsyncAction<any>) => {
        const reduceHandler = actionsMap.get(action.type);

        if (!reduceHandler) {
            return state;
        }

        return reduceHandler(state, action.payload, action);
    });

    reducer.on = <ReturnType, ArgType>(
        action: TActionCreatorFunction<IFunctionThatReturn<ReturnType, ArgType>>,
        reduce: TReducerFunction<ReturnType>
    ) => {
        actionsMap.set(action.type, reduce);
        return reducer;
    };



    type TAsyncAction<PromiseType, ArgType> = TActionCreatorFunction<IFunctionThatReturn<Promise<PromiseType>, ArgType>>;

    reducer.onAsync = <PromiseType, ArgType>(
        action: TAsyncAction<PromiseType, ArgType>,
        reduceSuccess: TReducerFunction<PromiseType>,
        reduceFailure?: TReducerFunction<Error>,
        reduceBegin?: TReducerFunction<{ arguments: any[] }>
    ) => reducer.on(action, (state, payload, action: IAsyncAction<PromiseType|Error|{ arguments: any[] }>) => {
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
