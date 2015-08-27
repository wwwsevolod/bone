import {ActionCreator} from '../../src/ActionCreator';
import {createContext} from '../../src/createContext';
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



// Create Data Context
const TestContext = createContext(() => {
    return {
        todos: <Todo[]>[]
    }
}, (reduceHelper) => {
    reduceHelper.on(AddTodo, (state, payload) => {
        return Object.assign({}, state, {
            todos: state.todos.concat(new Todo(payload))
        });
    });

    reduceHelper.on(ResolveTodo, (state, payload) => {
        return Object.assign({}, state, {
            todos: state.todos.filter((todo) => todo.id !== payload)
        });
    });
})

const context = TestContext();

// You will see {todos: []}
console.log(context.getState());

new AddTodo(context.getDispatchFunction()).dispatch('Finish read of this example');

// You will see {todos: [<Todo>{title: 'Finish read of this example', isResolved: false}]}
console.log(context.getState());

new ResolveTodo(context.getDispatchFunction()).dispatch(context.getState().todos[0]);

// You just read first example, now your Todo list is empty!
console.log(context.getState());
