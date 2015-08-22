import {ActionCreator} from '../../src/ActionCreator';
import {createContext} from '../../src/createContext';
import {createReducer} from '../../src/createReducer';
import {IAction} from '../../src/Interfaces';


//Create actions
class AddTodo extends ActionCreator {
    dispatch(text: string) {
        return text;
    }
}

class ResolveTodo extends ActionCreator {
    dispatch(todo: Todo) {
        return todo.id;
    }
}

// Create Reducer
let counter = 0;

class Todo {
    title: string;
    id: number;
    isResolved: boolean = false;

    constructor(title: string) {
        this.title = title;
        this.id = counter++;
    }
}

const TodoList = createReducer(() => <Todo[]> []);

TodoList.on(AddTodo, (state, payload) => {
    return state.concat(new Todo(payload));
});


TodoList.on(ResolveTodo, (state, payload) => {
    return state.slice().splice(state.findIndex((value) => value.id === payload), 1);
});

// Create Data Context

// May be in next TypeScript version you will not need to define interface of data context explitit
// But for now it is only type overhead
interface ITodoListState {
    todos: Todo[]
}

const TestContext = createContext({
    reduceState(state: ITodoListState, action: IAction<any>): ITodoListState {
        return {
            todos: TodoList(state.todos, action)
        };
    }
});

const context = new TestContext();

// You will see {todos: []}
console.log(context.getState());

new AddTodo(context.getDispatchFunction()).dispatch('Finish read of this example');

// You will see {todos: [<Todo>{title: 'Finish read of this example', isResolved: false}]}
console.log(context.getState());

new ResolveTodo(context.getDispatchFunction()).dispatch(context.getState().todos[0]);

// You just read first example, now your Todo list is empty!
console.log(context.getState());
