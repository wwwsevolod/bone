import {InitAction, IActionCreator, TActionFunction, IFunctionThatReturn} from './createAction';
import {IAction} from './Interfaces';

export interface IReducer<State> {
    (state: State, action: IAction<any>): State
    on<ReturnType, ArgType>(action: TActionFunction<IFunctionThatReturn<ReturnType, ArgType>>, reduce: (state: State, action: IAction<ReturnType>) => State): IReducer<State>;
}

export function createReducer<State>(onInit: () => State) {
    const actionsMap = new Map<any, (state: State, action: IAction<any>) => State>();
    const reducer = <IReducer<State>> ((state: State, action: IAction<any>) => {
        const reduceHandler = actionsMap.get(action.type);
        if (!reduceHandler) {
            return state;
        }
        return reduceHandler(state, action);
    });

    reducer.on = <ReturnType, ArgType>(action: TActionFunction<IFunctionThatReturn<ReturnType, ArgType>>, reduce: (state: State, action: IAction<ReturnType>) => State) => {
        actionsMap.set(action.type, reduce);
        return reducer;
    };

    return reducer.on(InitAction, onInit);
};
