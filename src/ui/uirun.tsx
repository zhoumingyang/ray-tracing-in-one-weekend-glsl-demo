import * as React from "react";
import * as ReactDOM from "react-dom";
import { ColorPanel } from "./colorpanel/colorpanel";
import { Handler } from "../handler";

export const uiRun = (handler: Handler) => {
    ReactDOM.render(<ColorPanel setSelectedColor={handler.setSelectedColor.bind(handler)} />,
        document.getElementById('color-panel-container'));
}