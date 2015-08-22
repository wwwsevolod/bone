import {AbstractActionCreator} from '../src/AbstractActionCreator';
import {IAction} from '../src/Interfaces';

describe('createActionCreator — function that helps to create action creator from function', () => {
    class Creator extends AbstractActionCreator {
        dispatch() {
            return 123;
        }

        protected wrapDispatch(func: any) { return func; }
    }

    it('should generate class that extends ActionCreator', () => {

        expect(new Creator((a: IAction<any>) => {}) instanceof AbstractActionCreator).toBe(true);

        expect(Creator.getActionType()).toBe('Creator');
    });

    it('should handle `is` method', () => {
        const actionCreator = new Creator((action: IAction<any>) => {
            expect(Creator.is(action)).toBe(true);
        });

        actionCreator.dispatch();

        class SecondCreator extends AbstractActionCreator {
            dispatch() {
                return 123;
            }

            protected wrapDispatch(func: any) { return func; }
        }

        const secondActionCreator = new SecondCreator((action: IAction<any>) => {
            expect(Creator.is(action)).toBe(false);
        }).dispatch();
    });
});
