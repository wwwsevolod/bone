/// <reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts" />

import {Context} from '../src/Context';
import {Connect, InjectAction} from '../src/decorators';
import {ActionCreator} from '../src/ActionCreator';
import {Component} from 'react';
import 'reflect-metadata';

describe('InjectAction', () => {
    class TestContext extends Context<any> {
        init() {
            this.setReducer((state, action) => {
                return state;
            });
        }
    }

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
            context: new TestContext()
        });

        expect(() => component.testAction.dispatch(1)).not.toThrow();
    });
});

describe('Connect', () => {
    interface TestState {
        test: number
    }
    class TestContext extends Context<TestState> {
        init() {
            this.setReducer((state, action) => {
                return {
                    test: 123
                };
            });
        }
    }

    it('should get state from context and map it to contextState field in Component instance', () => {
        class TestAction extends ActionCreator {
            dispatch(a: number) {
                return a;
            }
        }

        @Connect(TestContext)
        class TestComponent extends Component<any, any> {
            contextState: TestState
        }

        const component = new TestComponent({}, {
            contextState: new TestContext().getState()
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
            contextState: new TestContext().getState()
        });

        expect(component.contextState.asd).toBe(123 * 2);
    });
});
