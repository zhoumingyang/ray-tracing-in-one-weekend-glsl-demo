import * as React from "react";
import "./style.css"
import { CONFIG } from "../uiconfig";
import { vec3 } from "../../math/vec";

interface Props {
    [propName: string]: any;
}

interface State {
    [propName: string]: any;
}

export class ColorPanel extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            colorKey: 'white',
            currentProductColor: null
        }
    }

    onHeadBlockClick(colorKey: string) {
        this.setState({ colorKey: colorKey });
    }

    onProductBlockClick(color: string) {
        let start: number = color.indexOf('rgb(');
        let end: number = color.indexOf(')');
        if (start === -1 || end === -1) {
            return;
        }
        start += 4;
        const rgb: string = color.slice(start, end);
        const rgbArray = rgb.split(',');
        if (rgbArray.length !== 3) {
            return;
        }
        let r: number = parseFloat(rgbArray[0]);
        let g: number = parseFloat(rgbArray[1]);
        let b: number = parseFloat(rgbArray[2]);
        if (r > 1) r /= 256;
        if (g > 1) g /= 256;
        if (b > 1) b /= 256;
        if (this.props && this.props.setSelectedColor) {
            this.props.setSelectedColor(new vec3(r, g, b));
        }
    }

    createHeadColorBlock(): any[] {
        const result: any[] = [];
        for (let key in CONFIG.colorBlock) {
            result.push(
                <span className={`color-header-block`} id={`${key}Block`} style={{
                    backgroundColor: CONFIG.colorBlock[key]
                }} onClick={() => this.onHeadBlockClick(key)}></span>
            );
        }
        return result;
    }

    createProductColorBlock(): any[] {
        const result: any[] = [];
        const colorArray = CONFIG.productList[this.state.colorKey];
        if (!colorArray) {
            return result;
        }
        colorArray.forEach((color: string) => {
            result.push(
                <div className={`color-product-block`} style={{ backgroundColor: color }}
                    onClick={() => this.onProductBlockClick(color)}>
                </div>);
        });
        return result;
    }

    render() {
        const headColorBlocks: any[] = this.createHeadColorBlock();
        const colorList: any[] = this.createProductColorBlock();
        return (
            <div className={`color-product-container`}>
                <div className={`color-product-header`}>
                    {headColorBlocks}
                </div>
                <div className={`color-list-content`}>
                    {colorList}
                </div>
            </div>
        )
    }
}