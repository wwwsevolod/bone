import {InitAction} from './createAction';
import {IActionCreator, TActionCreatorFunction} from './createActionCreator';
import {IAction, IAsyncAction} from './Interfaces';
import {STATUS_BEGIN, STATUS_FAILURE, STATUS_SUCCESS} from './createAsyncAction';

export interface IFunctionThatReturn<ReturnType, ArgType> {
    (options: ArgType): ReturnType;
}

export interface IReducer<State> {
    (state: State, action: IAction<any>): State
    on<ReturnType, ArgType>(action: TActionCreatorFunction<IFunctionThatReturn<ReturnType, ArgType>>, reduce: (state: State, action: IAction<ReturnType>) => State): IReducer<State>;
    onAsync<ReturnType, ArgType>(action: TActionCreatorFunction<IFunctionThatReturn<Promise<ReturnType>, ArgType>>, reduce: (state: State, action: IAction<ReturnType>) => State): IReducer<State>;
}

export function createReducer<State>(onInit: () => State) {
    type TReducerFunction<P> = (state: State, payload: P, action: IAction<P>) => State;
    type TAsyncReducerFunction<P> = (state: State, payload: P, action: IAction<P>) => State;

    interface IAsyncReducers<Value> {
        onBegin?(state: State, reducer: TReducerFunction<{ arguments: any[] }>): State;
        onSuccess?(state: State, reducer: TReducerFunction<Value>): State;
        onFailure?(state: State, reducer: TReducerFunction<Error>): State;
    }

    type TActionMapValue = TReducerFunction<any> | TAsyncReducerFunction<any> | IAsyncReducers<any>;

    const actionsMap = new Map<any, TActionMapValue>();

    const reducer = <IReducer<State>> ((state: State, action: IAction<any>|IAsyncAction<any>) => {
        const reduceHandlerContainer = actionsMap.get(action.type);

        let reduceHandler: TAsyncReducerFunction<any>|TReducerFunction<any>;

        if (typeof reduceHandlerContainer === 'function') {
            reduceHandler = <TReducerFunction<any>> reduceHandlerContainer;
        } else {
            const status = (action as IAsyncAction<any>).status;
            if (status === STATUS_SUCCESS) {
                reduceHandler = (<IAsyncReducers<any>> reduceHandlerContainer).onSuccess
            } else if (status === STATUS_FAILURE) {
                reduceHandler = (<IAsyncReducers<any>> reduceHandlerContainer).onFailure
            } else if (status === STATUS_BEGIN) {
                reduceHandler = (<IAsyncReducers<any>> reduceHandlerContainer).onBegin
            }
        }

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



    type TAsyncAction<ReturnType, ArgType> = TActionCreatorFunction<IFunctionThatReturn<Promise<ReturnType>, ArgType>>;

    function onAsync<ReturnType, ArgType>(
        action: TAsyncAction<ReturnType, ArgType>,
        reduceSuccess: TAsyncReducerFunction<ReturnType>,
        reduceFailure?: TAsyncReducerFunction<Error>,
        reduceBegin?: TAsyncReducerFunction<{arguments: any[]}>
    ): IReducer<State>
    function onAsync<PromiseType, ArgType>(
        action: TAsyncAction<PromiseType, ArgType>,
        reducers: IAsyncReducers<PromiseType>
    ): IReducer<State>
    function onAsync<PromiseType, ArgType>(action, reducers, reduceFailure?, reduceBegin?): IReducer<State> {
        if (typeof reducers === 'function') {
            actionsMap.set(action.type, {
                onSuccess: reducers,
                onFailure: reduceFailure,
                onBegin: reduceBegin
            });

            return reducer;
        }

        actionsMap.set(action.type, reducers);

        return reducer;
    }

    reducer.onAsync = onAsync;

    return reducer.on(InitAction, onInit);
};
