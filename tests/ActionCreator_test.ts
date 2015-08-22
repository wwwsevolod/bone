import {ActionCreator} from '../src/ActionCreator';
import {IAction} from '../src/Interfaces';

describe('ActionCreator — clsas to create that creates action creator from function and saves its signature', () => {
    class Creator extends ActionCreator {
        dispatch(arg: number) {
            return 123 + arg;
        }
    }

    it('should return result of initial function', () => {
        const funcCreator = (arg: number) => {
            return 123 + arg;
        };

        const actionCreator = new Creator((action: IAction<any>) => {
            it('should dispatch good shaped Action', () => {
                expect(action.payload).toBe(124);
                expect(action.type).toBe('creator');
            });
        });

        expect(actionCreator.dispatch(1)).toBe(funcCreator(1));
    });
});
