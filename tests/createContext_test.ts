import {createContext} from '../src/createContext';
import {createReducer} from '../src/createReducer';
import {createAction} from '../src/createAction';

describe('createContext — function that constructs new class for Context', () => {
    const TestAction = createAction('TestAction', (test: number) => test);

    const TestReducer = createReducer(() => ({
        result: 123
    }));

    TestReducer.on(TestAction, (state, payload) => {
        return Object.assign(state, {
            result: state.result + payload
        });
    });


    it('should generate context class and pass all tests', () => {
        interface ITestContextState {
            test: {
                result: number
            }
        }

        const TestContext = createContext({
            actions: {
                TestAction
            },

            reduceState(state: ITestContextState, action): ITestContextState {
                return {
                    test: TestReducer(state.test, action)
                };
            }
        });

        const context = new TestContext();

        expect(context.getState()).toBe({
            test: {
                result: 123
            }
        });

        context.actions.TestAction(1);

        expect(context.getState()).toBe({
            test: {
                result: 124
            }
        });
    });
});
