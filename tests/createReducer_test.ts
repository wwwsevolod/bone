import {createReducer} from '../src/createReducer';
import {ActionCreator, InitAction} from '../src/ActionCreator';
import {AsyncActionCreator, STATUS_BEGIN, STATUS_FAILURE, STATUS_SUCCESS} from '../src/AsyncActionCreator';

describe('createReducer — a way to run out from endless switch-case statements in handling sync and async actions', () => {
    class IncrementAction extends ActionCreator {
        dispatch(n: number = 1) {
            return n;
        }
    }

    class IncrementAsyncAction extends AsyncActionCreator {
        dispatch(n: number = 1) {
            return Promise.resolve(n);
        }
    }

    const error = new Error('test');

    class AsyncActionThatWouldFail extends AsyncActionCreator {
        dispatch(n: number = 1) {
            return new Promise<number>(() => { throw error; });
        }
    }


    it('should create right-shaped reducer function', () => {
        const counter = createReducer(() => 0);

        counter.on(IncrementAction, (state, payload) => {
            return state + payload;
        });

        counter.onAsync(IncrementAsyncAction,
            (state, payload) => state + payload,
            (state, error) => state - 1,
            (state, args) => state + 1
        );

        counter.onAsync(AsyncActionThatWouldFail,
            (state, payload) => state + payload,
            (state, error) => state - 2,
            (state, args) => state + 2
        );

        expect(typeof counter.on).toBe('function');
        expect(typeof counter.onAsync).toBe('function');

        it('should respond to init action with initial state', () => {
            expect(counter(1, {
                type: InitAction.getActionType(),
                payload: null
            })).toBe(0);
        });

        it('should respond to unknown action with current state (previously set)', () => {
            expect(counter(0, {
                type: 'SOME RANDOM TYPE',
                payload: 123123
            })).toBe(0);
        });

        it('should reduce to knew state on known action', () => {
            new IncrementAction((action) => {
                expect(counter(0, action)).toBe(0 + action.payload);
            }).dispatch(10);

            new IncrementAction((action) => {
                expect(counter(0, action)).toBe(0 + action.payload);
            }).dispatch(-10);
        });

        it('should reduce to knew state on known async action', (done) => {
            new IncrementAsyncAction((action) => {
                if (action.type === STATUS_BEGIN) {
                    expect(counter(0, action)).toBe(1);
                }

                if (action.type === STATUS_SUCCESS) {
                    expect(counter(0, action)).toBe(10);

                    done();
                }
            }).dispatch(10);
        });

        it('should reduce to knew state on known async action and handle errors', (done) => {
            new AsyncActionThatWouldFail((action) => {
                if (action.type === STATUS_BEGIN) {
                    expect(counter(0, action)).toBe(2);
                }

                if (action.type === STATUS_FAILURE) {
                    expect(counter(0, action)).toBe(-2);

                    done();
                }
            }).dispatch(10);
        });
    });
});
