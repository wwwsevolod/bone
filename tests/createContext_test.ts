import {createContext} from '../src/createContext';
import {ActionCreator} from '../src/ActionCreator';
import {IAction} from '../src/Interfaces';

describe('Context — abstract class that needs to be extend to create new Context class for your application', () => {
    class TestAction extends ActionCreator {
        dispatch(test: number) {
            return test;
        }
    }


    it('should generate context class and pass all tests', () => {
        interface ITestContextState {
            test: {
                result: number
            }
        }

        const TestContext = createContext(() => {
            return {
                test: {
                    result: 123
                }
            };
        }, (helper) => {
            helper.on(TestAction, (state, payload) => {
                state.test.result += payload;
                return state;
            });
        });

        const context = TestContext();

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
