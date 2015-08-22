import {AsyncActionCreator, STATUS_BEGIN, STATUS_FAILURE, STATUS_SUCCESS} from '../src/AsyncActionCreator';
import {IAsyncAction} from '../src/Interfaces';

describe('AsyncActionCreator — class that creates async action', () => {
    it('should dispatch IAsyncAction at begin and at success', (done) => {
        const dispatcher = {
            dispatcher(action: IAsyncAction<any>) {}
        };

        class Creator extends AsyncActionCreator {
            dispatch(arg: number) {
                return Promise.resolve(123 + arg);
            }
        }

        spyOn(dispatcher, 'dispatcher');

        const actionCreator = new Creator(dispatcher.dispatcher);

        const promise = actionCreator.dispatch(1);

        expect(dispatcher.dispatcher).toHaveBeenCalledWith({
            type: 'Creator',
            payload: { arguments: [1] },
            status: STATUS_BEGIN
        });

        promise.then((result) => {
            expect(result).toBe(124);

            expect(dispatcher.dispatcher).toHaveBeenCalledWith({
                type: 'Creator',
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

        class CreatorThatFails extends AsyncActionCreator {
            dispatch(arg: number): Promise<number> {
                throw error;
            }
        }

        const actionCreator = new CreatorThatFails(dispatcher.dispatcher);

        expect(() => actionCreator.dispatch(1)).toThrow();

        expect(dispatcher.dispatcher).toHaveBeenCalledWith({
            type: 'CreatorThatFails',
            payload: { arguments: [1] },
            status: STATUS_BEGIN
        });

        expect(dispatcher.dispatcher).toHaveBeenCalledWith({
            type: 'CreatorThatFails',
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

        class CreatorThatFailsInPromise extends AsyncActionCreator {
            dispatch(arg: number): Promise<any> {
                return Promise.reject(error);
            }
        }

        const actionCreator = new CreatorThatFailsInPromise(dispatcher.dispatcher);

        const promise = actionCreator.dispatch(1);

        expect(dispatcher.dispatcher).toHaveBeenCalledWith({
            type: 'CreatorThatFailsInPromise',
            payload: { arguments: [1] },
            status: STATUS_BEGIN
        });

        promise.catch(() => {
            expect(dispatcher.dispatcher).toHaveBeenCalledWith({
                type: 'CreatorThatFailsInPromise',
                payload: error,
                error: true,
                status: STATUS_FAILURE
            });

            done();
        });
    });
});
