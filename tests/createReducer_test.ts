import {createReducer} from '../src/createReducer';
import {createAction, InitAction} from '../src/createAction';
import {createAsyncAction, STATUS_BEGIN, STATUS_FAILURE, STATUS_SUCCESS} from '../src/createAsyncAction';

describe('createReducer — a way to run out from endless switch-case statements in handling sync and async actions', () => {
    const IncrementAction = createAction('increment', (n: number = 1) => n);
    const IncrementAsyncAction = createAsyncAction('asyncIncrement', (n: number = 1) => Promise.resolve(n));

    const error = new Error('test');
    const AsyncActionThatWouldFail = createAsyncAction('asyncFail', (n: number = 1) => new Promise<number>(() => { throw error; })); // Because Promise.reolve(123).then(() => {throw error}) is inferring as Promise<void>

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
                type: InitAction.type,
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
            IncrementAction.setDispatcher((action) => {
                expect(counter(0, action)).toBe(0 + action.payload);
            })(10);

            IncrementAction.setDispatcher((action) => {
                expect(counter(0, action)).toBe(0 + action.payload);
            })(-10);
        });

        it('should reduce to knew state on known async action', (done) => {
            IncrementAsyncAction.setDispatcher((action) => {
                if (action.type === STATUS_BEGIN) {
                    expect(counter(0, action)).toBe(1);
                }

                if (action.type === STATUS_SUCCESS) {
                    expect(counter(0, action)).toBe(10);

                    done();
                }
            })(10);
        });

        it('should reduce to knew state on known async action and handle errors', (done) => {
            AsyncActionThatWouldFail.setDispatcher((action) => {
                if (action.type === STATUS_BEGIN) {
                    expect(counter(0, action)).toBe(2);
                }

                if (action.type === STATUS_FAILURE) {
                    expect(counter(0, action)).toBe(-2);

                    done();
                }
            })(10);
        });
    });
});
