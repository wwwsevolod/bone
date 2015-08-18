import {createActionCreator} from '../src/createActionCreator';
import {IAction} from '../src/Interfaces';

describe('createActionCreator — function that helps to create action creator from function', () => {
    it('should generate function with methods that implements `IActionCreator`', () => {
        const creator = createActionCreator('creator', () => {
            return 123;
        });

        expect(creator.type).toBe('creator');
        expect(typeof creator.is).toBe('function');
        expect(typeof creator.setDispatcher).toBe('function');
    });

    it('should create `is` method', () => {
        const creator = createActionCreator('creator', () => {
            return 123;
        });

        const actionCreator = creator.setDispatcher((action: IAction<any>) => {
            expect(creator.is(action)).toBe(true);
        });

        actionCreator();

        const secondCreator = createActionCreator('secondCreator', () => {
            return 123;
        });

        const secondActionCreator = creator.setDispatcher((action: IAction<any>) => {
            expect(creator.is(action)).toBe(false);
        });

        secondActionCreator();
    });
});
