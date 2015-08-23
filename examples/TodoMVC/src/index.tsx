import {ActionCreator} from '../../../src/ActionCreator';
import {Context} from '../../../src/Context';
import {createReducer} from '../../../src/createReducer';
import {IAction} from '../../../src/Interfaces';
import {Root} from '../../../src/Root';
import {Connect, InjectAction} from '../../../src/decorators';
import * as React from 'react';

// Create Reducer
let counter = 0;

class Todo {
    title: string;
    id: number;

    constructor(title: string) {
        this.title = title;
        this.id = counter++;
    }
}

//Create actions
class AddTodo extends ActionCreator {
    dispatch(text: string) {
        return new Todo(text);
    }
}

class ResolveTodo extends ActionCreator {
    dispatch(todo: Todo) {
        return todo;
    }
}

class UnResolveTodo extends ActionCreator {
    dispatch(todo: Todo) {
        return todo;
    }
}

const ActiveTodoList = createReducer(() => [] as Todo[]);

ActiveTodoList.on(AddTodo, (state, payload) => {
    return state.concat(payload);
});


ActiveTodoList.on(ResolveTodo, (state, payload) => {
    const newState = state.slice();
    newState.splice(state.findIndex((value) => value === payload), 1);
    return newState;
});

ActiveTodoList.on(UnResolveTodo, (state, payload) => {
    return state.concat(payload);
});

const ResolvedTodoList = createReducer(() => [] as Todo[]);

ResolvedTodoList.on(ResolveTodo, (state, payload) => {
    return state.concat(payload);
});


ResolvedTodoList.on(UnResolveTodo, (state, payload) => {
    const newState = state.slice();
    newState.splice(state.findIndex((value) => value === payload), 1);
    return newState;
});

// Create Data Context

// May be in next TypeScript version you will not need to define interface of data context explitly
// But for now it is main overhead on Types
interface ITodoListState {
    activeTodos: Todo[]
    resolvedTodos: Todo[]
}

class TodoContext extends Context<ITodoListState> {
    init() {
        this.setReducer((state, action) => {
            return {
                activeTodos: ActiveTodoList(state.activeTodos, action),
                resolvedTodos: ResolvedTodoList(state.resolvedTodos, action)
            };
        });
    }
}

@Connect(TodoContext)
class TodoApp extends React.Component<any, any> {
    contextState: ITodoListState

    @InjectAction
    private resolveTodo: ResolveTodo

    @InjectAction
    private unResolveTodo: UnResolveTodo

    @InjectAction
    private addTodo: AddTodo

    state = {
        newTodo: ''
    };

    private handleTodo(event: React.FormEvent) {
        event.preventDefault();

        if (!this.state.newTodo.trim()) {
            return;
        }

        this.addTodo.dispatch(this.state.newTodo);

        this.setState({
            newTodo: ''
        });
    }

    render() {
        return <div className="TodoApp">
            <div className="TodoApp__AddTodo">
                <form onSubmit={(e) => this.handleTodo(e)}>
                    <input type="text" value={this.state.newTodo} onChange={
                        (event) => this.setState({
                            //bcz fuck you typescript, thats why =\\ wrong event target definition in lib.d.ts
                            newTodo: (event.nativeEvent.target as any).value as string
                        })
                    } />
                </form>
            </div>
            <div className="TodoApp__List TodoApp__List_active">
                {this.contextState.activeTodos.slice().reverse().map((todo) => <div
                    key={todo.id}
                    className="TodoApp__Todo"
                    onClick={() => this.resolveTodo.dispatch(todo)}
                >{todo.title}</div>)}
            </div>
            <div className="TodoApp__List TodoApp__List_resolved">
                {this.contextState.resolvedTodos.map((todo) => <div
                    key={todo.id}
                    className="TodoApp__Todo TodoApp__Todo_resolved"
                    onClick={() => this.unResolveTodo.dispatch(todo) }
                >{todo.title}</div>)}
            </div>
        </div>;
    }
}


const context = new TodoContext();

React.render(<Root context={context}>
    {() => <TodoApp />}
</Root>, document.querySelector('#root'));
