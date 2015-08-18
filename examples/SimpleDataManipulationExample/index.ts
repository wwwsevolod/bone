import {createAction} from '../../src/createAction';
import {createContext} from '../../src/createContext';
import {createReducer} from '../../src/createReducer';


//Create actions
const AddTodo = createAction('AddTodo', (text: string) => text);
const ResolveTodo = createAction('ResolveTodo', (todo: Todo) => todo.id);


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
    actions: {
        addTodo: AddTodo,
        resolveTodo: ResolveTodo
    },
    reduceState(state: ITodoListState, action): ITodoListState {
        return {
            todos: TodoList(state.todos, action)
        };
    }
});

const context = new TestContext();

// You will see {todos: []}
console.log(context.getState());

context.actions.addTodo('Finish read of this example');

// You will see {todos: [<Todo>{title: 'Finish read of this example', isResolved: false}]}
console.log(context.getState());

context.actions.resolveTodo(context.getState().todos[0]);

// You just read first example, now your Todo list is empty!
console.log(context.getState());
