import * as React from "react";

export abstract class ReducerComponent<
    TProps,
    TState,
    TDispatch,
    TActions
> extends React.Component<TProps, TState> {
    protected abstract get actions(): TActions;
    protected abstract get handlers(): { [TKey in keyof TDispatch]: (state: TState, data: TDispatch[TKey]) => TState };

    protected dispatch<TKey extends keyof TDispatch>(key: TKey, data: TDispatch[TKey]): void {
        this.setState(this.handlers[key](this.state, data));
    }
}
