export interface IAction<PayloadType> {
    type: string;
    error?: boolean;
    payload: PayloadType;
    meta?: any;
}

export interface IDispatcherFunction {
    (action: IAction<any>): void;
}
