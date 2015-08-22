import {createAsyncAction, STATUS_BEGIN, STATUS_FAILURE, STATUS_SUCCESS} from '../src/createAsyncAction';
import {IAsyncAction} from '../src/Interfaces';

describe('createAsyncAction — function that creates action creator from function and saves its signature', () => {
    it('should dispatch IAsyncAction at begin and at success', (done) => {
        const dispatcher = {
            dispatcher(action: IAsyncAction<any>) {}
        };

        spyOn(dispatcher, 'dispatcher');

        const funcCreator = (arg: number) => {
            return Promise.resolve(123 + arg);
        };
        const Creator = createAsyncAction('creator', funcCreator);

        const actionCreator = new Creator(dispatcher.dispatcher);

        const promise = actionCreator.dispatch(1);

        expect(dispatcher.dispatcher).toHaveBeenCalledWith({
            type: 'creator',
            payload: { arguments: [1] },
            status: STATUS_BEGIN
        });

        promise.then((result) => {
            expect(result).toBe(124);

            expect(dispatcher.dispatcher).toHaveBeenCalledWith({
                type: 'creator',
                payload: result,
                status: STATUS_SUCCESS
            });

            done();
        });
    });

    it('should dispatch IAsyncAction at begin and at failure (on actionFunction call, not on reject of Promise, if error occured)', () => {
        const dispatcher = {
            dispatcher(action: IAsyncAction<any>) { }
        };

        spyOn(dispatcher, 'dispatcher');

        const error = new Error('Does not good enough');

        const funcCreator = (arg: number):Promise<any> => {
            throw error;
        };
        const Creator = createAsyncAction('creator', funcCreator);

        const actionCreator = new Creator(dispatcher.dispatcher);

        expect(() => actionCreator.dispatch(1)).toThrow();

        expect(dispatcher.dispatcher).toHaveBeenCalledWith({
            type: 'creator',
            payload: { arguments: [1] },
            status: STATUS_BEGIN
        });

        expect(dispatcher.dispatcher).toHaveBeenCalledWith({
            type: 'creator',
            payload: error,
            error: true,
            status: STATUS_FAILURE
        });
    });

    it('should dispatch IAsyncAction at begin and at failure on promise reject', (done) => {
        const dispatcher = {
            dispatcher(action: IAsyncAction<any>) { }
        };

        spyOn(dispatcher, 'dispatcher');

        const error = new Error('Does not good enough');

        const funcCreator = (arg: number): Promise<any> => {
            return Promise.reject(error);
        };
        const Creator = createAsyncAction('creator', funcCreator);

        const actionCreator = new Creator(dispatcher.dispatcher);

        const promise = actionCreator.dispatch(1);

        expect(dispatcher.dispatcher).toHaveBeenCalledWith({
            type: 'creator',
            payload: { arguments: [1] },
            status: STATUS_BEGIN
        });

        promise.catch(() => {
            expect(dispatcher.dispatcher).toHaveBeenCalledWith({
                type: 'creator',
                payload: error,
                error: true,
                status: STATUS_FAILURE
            });

            done();
        });
    });
});
