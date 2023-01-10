import { h, FunctionComponent, createContext } from "preact";
import { useMemo, useRef, useContext } from "preact/hooks";
import {
  createContext as createContextSelectable,
  useContextSelector,
} from "use-context-selector";

type SelectorType<StateType, ReturnType> = (state: StateType) => ReturnType;

export const createProvider = <StateType, Actions, ProviderProps>(
  controller: (props: ProviderProps) => [state: StateType, actions: Actions]
) => {
  const StateContext = createContextSelectable<StateType>(null as any);
  const DispatchContext = createContext<Actions>(null as any);

  const Provider: FunctionComponent<ProviderProps> = ({
    children,
    ...props
  }) => {
    const [state, _actions] = controller(props as any);
    const actionsRef = useRef(_actions);

    actionsRef.current = _actions;

    // stable actions
    const actions = useMemo(() => {
      const result = {} as any;
      Object.keys(actionsRef.current as any).map((key) => {
        result[key] = (...args: any[]) =>
          ((actionsRef.current as any)[key] as CallableFunction)?.(...args);
      });
      return result as Actions;
    }, [actionsRef]);

    return (
      <StateContext.Provider value={state}>
        <DispatchContext.Provider value={actions}>
          {children}
        </DispatchContext.Provider>
      </StateContext.Provider>
    );
  };

  const useActions = () => useContext(DispatchContext);
  const useStateContext = function <SelectorReturn>(
    selector: SelectorType<StateType, SelectorReturn>
  ) {
    return useContextSelector(StateContext, selector);
  };

  return [Provider, useActions, useStateContext] as const;
};
