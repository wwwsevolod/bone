import {Context, ContextState} from './Context';
import {ActionsCreator} from './ActionsCreator';
import {Reducer} from './Reducer';

interface Todo {
    isResolved: boolean;
    text: string;
}

interface TodoState extends ContextState {
    todos: Todo[];
}

class TodoReducer extends Reducer<Todo[]> {
    protected init() {
        this.on('init', () => []);

        this.on('TodoActions:add:begin', (todos: Todo[] = [], todo: Todo) => todos.concat(todo));
    }
}

class TodoActions extends ActionsCreator {
    add(text: string) {
        return {
            isResolved: false,
            text: text
        };
    }
}

class TodoContext extends Context<TodoState> {
    protected computeState(state: TodoState, action): TodoState {
        return {
            todos: new TodoReducer(action).reduce(state.todos)
        };
    }
}

console.log(1);
const context = new TodoContext();
const actions = new TodoActions(context);
console.log(context.state.todos.slice());
actions.add('test');
console.log(context.state.todos.slice());
