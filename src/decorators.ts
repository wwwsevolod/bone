// <reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts" />

import {Context} from '../src/createContext';
import {AbstractActionCreator, AbstractActionCreatorClass} from '../src/AbstractActionCreator';
import * as React from 'react';
import 'reflect-metadata';


const actionsOnDispatcher = new Map<Context<any>, Map<AbstractActionCreatorClass, AbstractActionCreator>>();

function getAction(ActionClass: AbstractActionCreatorClass) {
    if (!this.context || !this.context.context) {
        throw new Error(`There must be 'context' in React component's context`);
    }
    if (!actionsOnDispatcher.has(this.context.context)) {
        actionsOnDispatcher.set(this.context.context, new Map());
    }
    const actionsMap = actionsOnDispatcher.get(this.context.context);
    if (!actionsMap.has(ActionClass)) {
        actionsMap.set(ActionClass, new ActionClass(this.context.context.getDispatchFunction()));
    }
    return actionsMap.get(ActionClass);
}

/**
 * Inject Action on property, by type from property descriptor type
 */
export function InjectAction(target: React.Component<any, any>, key: string) {
    const ActionClass: AbstractActionCreatorClass = Reflect.getMetadata('design:type', target, key);

    Object.defineProperty(target, key, {
        // any on getter return because typescript defineProperty definition
        get(): any {
            return getAction.call(this, ActionClass);
        }
    });
}

/**
 * Inject Action on property, by type passed in
 */
export function InjectActionCreator(ActionClass: AbstractActionCreatorClass) {
    return function(target: React.Component<any, any>, key: string) {
        Object.defineProperty(target, key, { get(): any {
            return getAction.call(this, ActionClass);
        }});
    };
}


export interface ComponentToInject extends React.Component<any, any> {
    contextState: any;
    refs: any;
}

export interface ComponentToInjectClass extends React.ComponentClass<any> {
    new(...any: any[]): ComponentToInject
}

export function Connect<ContextState>(contextClass: { (...any: any[]): Context<ContextState> }, getter?: (state: ContextState) => any) {
    if (!getter) {
        getter = (state) => state;
    }

    return function(target: ComponentToInjectClass) {
        if (!target.contextTypes) {
            target.contextTypes = {};
        }

        const contextTypes = <any>target.contextTypes;

        if (contextTypes.contextState) {
            throw new Error('there is contextState declartion in contextTypes already');
        }

        contextTypes.context = React.PropTypes.instanceOf(Context).isRequired;
        contextTypes.contextState = React.PropTypes.any.isRequired;
        contextTypes.dispatchOnContext = React.PropTypes.func.isRequired;

        Object.defineProperty(target.prototype, 'contextState', {
            // any on getter return because typescript defineProperty definition
            get(): any {
                return getter(this.context.contextState);
            }
        });
    };
}
