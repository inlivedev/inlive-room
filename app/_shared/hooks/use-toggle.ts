import { useReducer } from 'react';

const ACTIVE = 'ACTIVE';
const INACTIVE = 'INACTIVE';
const TOGGLE = 'TOGGLE';

const reducer = (state: boolean, action: { type: string }) => {
  switch (action.type) {
    case ACTIVE:
      return true;
    case INACTIVE:
      return false;
    case TOGGLE:
      return !state;
    default:
      return state;
  }
};

export const useToggle = (initialValue = false) => {
  const [active, dispatch] = useReducer(reducer, !!initialValue);

  const setActive = () => dispatch({ type: ACTIVE });
  const setInActive = () => dispatch({ type: INACTIVE });
  const toggle = () => dispatch({ type: TOGGLE });

  return { active, toggle, setActive, setInActive };
};
