declare var process: any;

import {SerializableValue} from './Serializable';

export interface Action {
    type: string;
    error?: boolean;
    payload: SerializableValue;
    meta?: SerializableValue;
}
