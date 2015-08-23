import * as React from 'react';
import {Context} from './Context';
import {IAction} from './Interfaces';

export interface RootProps {
    children?: () => React.ReactElement<any>;
    context: Context<any>;
}

export class Root extends React.Component<RootProps, any> {
    static propTypes = {
        children: React.PropTypes.any.isRequired
    };

    static childContextTypes = {
        context: React.PropTypes.instanceOf(Context).isRequired,
        contextState: React.PropTypes.any.isRequired,
        dispatchOnContext: React.PropTypes.func.isRequired
    };

    constructor(props: RootProps, context: any) {
        super(props, context);

        this.state = {
            contextState: this.props.context.getState(),
            dispatchOnContext: this.props.context.getDispatchFunction()
        };

        this.mountListener();
    }

    componentWillUnmount() {
        this.unmountListener();
    }

    private listener() {
        this.setState({
            contextState: this.props.context.getState()
        });
    }

    private mountListener() {
        this.listener = this.listener.bind(this);
        this.props.context.register(this.listener);
    }

    private unmountListener() {
        this.props.context.unregister(this.listener);
        delete this.listener;
    }

    render() {
        return this.props.children();
    }

    getChildContext() {
        return {
            context: this.props.context,
            contextState: this.state.contextState,
            dispatchOnContext: this.state.dispatchOnContext
        };
    }
}

/**
class Provider extends Component {
    static childContextTypes = {
        store: storeShape.isRequired
    };

    static propTypes = {
        children: PropTypes.func.isRequired,
        store: storeShape.isRequired
    };

    getChildContext() {
        return { store: this.state.store };
    }

    constructor(props, context) {
        super(props, context);
        this.state = { store: props.store };
    }

    componentWillReceiveProps(nextProps) {
        const { store } = this.state;
        const { store: nextStore } = nextProps;

        if (store !== nextStore) {
            const nextReducer = nextStore.getReducer();
            store.replaceReducer(nextReducer);
        }
    }

    render() {
        const { children } = this.props;
        return children();
    }
}
*/
