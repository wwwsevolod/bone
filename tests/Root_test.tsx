import * as React from 'react/addons';
import {Root} from '../src/Root';
import {createContext} from '../src/createContext';
import {Connect} from '../src/decorators';


// TODO: write more tests for Root
describe('Root — React component, bridge for data context and react components', () => {
    const TestContext = createContext({
        getInitialState() {
            return { test: '123' }
        }
    });

    const context = TestContext();


    interface TestState {
        test: string
    }

    @Connect(TestContext)
    class TestComponent extends React.Component<any, any> {
        refs: any;
        contextState: TestState;

        render() {
            return <div id="id123">{this.contextState.test}</div>;
        }
    }

    it('should create context and pass it children', () => {
        const result = React.renderToString(<Root context={context}>
            {() => <TestComponent />}
        </Root>);

        expect(result).toMatch(/>123</);
    });
});
