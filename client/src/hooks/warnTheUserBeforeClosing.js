import React, { useState, useEffect } from "react";
import { Prompt } from "react-router-dom";
const WarnTheUserBeforeClosing = (message = "Changes that you made may not be saved. Are you sure you want to leave?") => {
  const [notSaved, setNotSaved] = useState(false);

  useEffect(() => {
    //Detecting browser closing
    window.onbeforeunload = notSaved && (() => message);

    return () => {
      window.onbeforeunload = null;
    };
    // eslint-disable-next-line
  }, [notSaved]);

  const routerPrompt = <Prompt when={notSaved} message={message} />;

  return [routerPrompt, () => setNotSaved(true), () => setNotSaved(false)];
};

export default WarnTheUserBeforeClosing;
