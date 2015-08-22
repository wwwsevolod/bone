import {createActionCreator, ActionCreator} from '../src/createActionCreator';
import {IAction} from '../src/Interfaces';

describe('createActionCreator — function that helps to create action creator from function', () => {
    it('should generate class that extends ActionCreator', () => {
        const Creator = createActionCreator('creator', () => {
            return 123;
        });

        expect(new Creator((a: IAction<any>) => {}) instanceof ActionCreator).toBe(true);

        expect(Creator.type).toBe('creator');
    });

    it('should handle `is` method', () => {
        const Creator = createActionCreator('creator', () => {
            return 123;
        });

        const actionCreator = new Creator((action: IAction<any>) => {
            expect(Creator.is(action)).toBe(true);
        });

        actionCreator.dispatch();

        const SecondCreator = createActionCreator('secondCreator', () => {
            return 123;
        });

        const secondActionCreator = new SecondCreator((action: IAction<any>) => {
            expect(Creator.is(action)).toBe(false);
        }).dispatch();
    });
});
