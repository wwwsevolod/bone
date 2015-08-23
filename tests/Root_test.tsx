import * as React from 'react/addons';
import {Root} from '../src/Root';
import {Context} from '../src/Context';
import {Connect} from '../src/decorators';


// TODO: write more tests for Root
describe('Root — React component, bridge for data context and react components', () => {
    interface TestState {
        test: string
    }
    class TestContext extends Context<TestState> {
        init() {
            this.setReducer((state, action) => {
                return {
                    test: '123'
                };
            });
        }
    }

    const context = new TestContext();

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
