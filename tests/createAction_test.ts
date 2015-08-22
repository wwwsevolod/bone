import {createAction} from '../src/createAction';
import {IAction} from '../src/Interfaces';

describe('createAction — function that creates action creator from function and saves its signature', () => {
    it('should throw error when calling creator function that is without set dispatcher', () => {
        const creator = createAction('creator', () => {
            return 123;
        });

        expect(creator).toThrow();
    });

    it('should return result of initial function', () => {
        const funcCreator = (arg: number) => {
            return 123 + arg;
        };
        const Creator = createAction('creator', funcCreator);

        const actionCreator = new Creator((action: IAction<any>) => {
            it('should dispatch good shaped Action', () => {
                expect(action.payload).toBe(4);
                expect(action.type).toBe('creator');
            });
        });

        expect(actionCreator.dispatch(1)).toBe(funcCreator(1));
    });
});
