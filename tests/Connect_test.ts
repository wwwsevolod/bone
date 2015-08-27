/// <reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts" />

import {createContext} from '../src/createContext';
import {Connect, InjectAction} from '../src/decorators';
import {ActionCreator} from '../src/ActionCreator';
import {Component} from 'react';
import 'reflect-metadata';

describe('InjectAction', () => {
    const TestContext = createContext({
        getInitialState() {
            return {
                test: 123
            };
        }
    });

    it('should inject actionCreator instance with dispatcher from React context', () => {
        class TestAction extends ActionCreator {
            dispatch(a: number) {
                return a;
            }
        }

        class TestComponent extends Component<any, any> {
            @InjectAction
            testAction: TestAction;
        }

        const component = new TestComponent({}, {
            context: TestContext()
        });

        expect(() => component.testAction.dispatch(1)).not.toThrow();
    });
});

describe('Connect', () => {
    const TestContext = createContext({
        getInitialState() {
            return {
                test: 123
            };
        }
    });

    it('should get state from context and map it to contextState field in Component instance', () => {
        class TestAction extends ActionCreator {
            dispatch(a: number) {
                return a;
            }
        }

        interface TestState {
            test: number
        }

        @Connect(TestContext)
        class TestComponent extends Component<any, any> {
            contextState: TestState
        }

        const component = new TestComponent({}, {
            contextState: TestContext().getState()
        });

        expect(component.contextState.test).toBe(123);
    });

    it('should get state from context and map it to contextState field in Component instance by getter function', () => {
        class TestAction extends ActionCreator {
            dispatch(a: number) {
                return a;
            }
        }

        @Connect(TestContext, (state) => {
            return {
                asd: state.test * 2
            };
        })
        class TestComponent extends Component<any, any> {
            contextState: {asd: number};
        }

        const component = new TestComponent({}, {
            contextState: TestContext().getState()
        });

        expect(component.contextState.asd).toBe(123 * 2);
    });
});
