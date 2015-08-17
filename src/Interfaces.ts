export interface IAction<PayloadType> {
    type: string;
    error?: boolean;
    payload: PayloadType;
    meta?: any;
}

export interface IAsyncAction<PayloadType> extends IAction<PayloadType> {
    status: string
}

export interface IDispatcherFunction {
    (action: IAction<any>): void;
}
