import { fireEvent, render } from "@testing-library/react";
import * as React from "react";
import { Provider } from "react-redux";
import configureMockFactory from "redux-mock-store";

import * as action from "../../action";
import { Answer } from "../../components/Answer";

it("dispatches ACK_REFOCUS when focus pending.", () => {
  const store = configureMockFactory()({
    focusPending: true,
    answers: new Map(),
  });

  const mockDispatch = jest.fn();
  store.dispatch = mockDispatch;

  render(
    <Provider store={store}>
      <Answer />
    </Provider>
  );

  expect(mockDispatch).toHaveBeenCalledTimes(1);
  expect(mockDispatch.mock.calls[0][0].type).toEqual(action.ACK_REFOCUS);
});

it("dispatches the actions.", () => {
  const store = configureMockFactory()({
    focusPending: true,
    answers: new Map(),
  });

  const mockDispatch = jest.fn();
  store.dispatch = mockDispatch;

  const rendered = render(
    <Provider store={store}>
      <Answer />
    </Provider>
  );

  fireEvent.change(rendered.getByTestId("answer"), {
    target: { value: "some answer" },
  });

  expect(mockDispatch).toHaveBeenCalledTimes(2);
  expect(mockDispatch.mock.calls[0][0].type).toEqual(action.ACK_REFOCUS);
  expect(mockDispatch.mock.calls[1][0]).toEqual(
    action.changeAnswer("some answer")
  );
});
