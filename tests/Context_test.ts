import {Context} from '../src/Context';
import {createReducer} from '../src/createReducer';
import {ActionCreator} from '../src/ActionCreator';
import {IAction} from '../src/Interfaces';

describe('Context — abstract class that needs to be extend to create new Context class for your application', () => {
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

        class TestContext extends Context<ITestContextState> {
            init() {
                this.setReducer((state, action) => {
                    return {
                        test: TestReducer(state.test, action)
                    };
                });
            }
        }

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
