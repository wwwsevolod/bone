import {createContext} from '../src/createContext';
import {createReducer} from '../src/createReducer';
import {ActionCreator} from '../src/ActionCreator';
import {IAction} from '../src/Interfaces';

describe('createContext — function that constructs new class for Context', () => {
    class TestAction extends ActionCreator {
        dispatch(test: number) {
            return test;
        }
    }

    const TestReducer = createReducer(() => ({
        result: 123
    }));

    TestReducer.on(TestAction, (state, payload) => {
        return {
            result: state.result + payload
        };
    });


    it('should generate context class and pass all tests', () => {
        interface ITestContextState {
            test: {
                result: number
            }
        }

        const TestContext = createContext({
            reduceState(state: ITestContextState, action: IAction<any>): ITestContextState {
                return {
                    test: TestReducer(state.test, action)
                };
            }
        });

        const context = new TestContext();

        expect(context.getState()).toEqual({
            test: {
                result: 123
            }
        });

        new TestAction(context.getDispatchFunction()).dispatch(1);

        expect(context.getState()).toEqual({
            test: {
                result: 124
            }
        });
    });
});
