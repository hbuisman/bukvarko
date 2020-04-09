import { IconButton } from "@material-ui/core";
import ArrowRight from "@material-ui/icons/ArrowRight";
import * as React from "react";
import { useDispatch } from "react-redux";

import * as actions from "../action";
import * as effect from "../effect";

export function NextQuestion() {
  const dispatch = useDispatch();

  return (
    <IconButton
      onClick={() => {
        dispatch(effect.nextQuestion());
        dispatch(actions.askToRefocus());
      }}
      data-testid="nextQuestion"
    >
      <ArrowRight fontSize="large" />
    </IconButton>
  );
}
