import React from 'react';
import * as ReactDom from 'react-dom';
import Draggable from 'react-draggable'; // The default
import { ScanActions } from "../actions/scan";
import { SvgButton } from "./svg-button";

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;
const SCALE_ZOOM = 1.5;


export class App extends React.Component {

  canvas;
  rotateCount;
  urlObjectImage;
  zoomImageCount;

  constructor(props) {
    super(props);

    this.rotateCount = 0;
    this.zoomImageCount = 0;
    this.scale = 1;

    this.state = {
      dataOptions: {},
      dataCrop: { originX: 10, originY: 10, width: 200, height: 200 },
      scannerSelected: null,
      inProgress: false,
      isScanned: false,
      fileName: "image"
    }
  }

  componentDidMount() {

    // récupération des propriétés de l'élément à scanner
    let data = ReactDom.findDOMNode(this).parentNode.getAttribute("data-crop");
    if (data) {
      data = JSON.parse(data);
      var dataCrop = {
        originX: data.originX,
        originY: data.originY,
        x: data.originX,
        y: data.originY,
        width: data.width,
        height: data.height
      }

      this.setState({ dataCrop: dataCrop });
    }

    // récupération des propriétés de l'élément à scanner
    let dataHost = ReactDom.findDOMNode(this).parentNode.getAttribute("data-host");
    if (dataHost) {
      this.setState({ dataHost: JSON.parse(dataHost) }, () => {
        // Récupération des options liées aux scanners
        ScanActions.getScanners().then((scanners) => {
          this.setState({ dataOptions: scanners });
        })
      });
    }
  }

  render() {

    return (
      <div className="hornet-scanner">
        <div className="form">
          <div className="select-area">{this.renderListScanners()}</div>
          <div className="buttons-area">{this.state.scannerSelected && this.renderActionButtons()}</div>
        </div>
        <div className="hornet-box image-renderer" style={{ position: 'relative', width: CANVAS_WIDTH + "px", height: CANVAS_HEIGHT + "px", }}>
          <canvas id="canvas" width={CANVAS_WIDTH + "px"} height={CANVAS_HEIGHT + "px"} ref={this.registerCanvas.bind(this)} />
          {this.state.isScanned && this.renderCropper()}
        </div>
        {this.state.isScanned && this.renderToolCrop()}
      </div>
    );
  }

  registerCanvas(element) {
    this.canvas = element;
  }


  /**
   * Rendu Html De la liste Select des scan
   */
  renderListScanners() {
    let options = [<option value={-1} key={"list-scanner-" + "-1"}>{"----"}</option>];
    if (this.state.dataOptions) {
      Object.keys(this.state.dataOptions).map((index) => {
        const option = this.state.dataOptions[index];
        options.push(<option value={option.id} key={"list-scanner-" + index}>{option}</option>)
      })
    }

    return (
      <select onChange={this.handleChangeScanner.bind(this)}>
        {options}
      </select>);
  }

  renderActionButtons() {
    return (
      <div className="element">
        <div id="actions">
          <button title="Preview" onClick={this.handleClickScan.bind(this, true, false)} id="preview" className="action">Preview</button>
          <button title="Scanner" onClick={this.handleClickScan.bind(this, false, true)} id="scanner" className="action">Scanner</button>
        </div>
      </div>
    );
  }

  renderCropper() {

    var style = {
      width: this.state.dataCrop.width + "px",
      height: this.state.dataCrop.height + "px",
      top: this.state.dataCrop.originY + "px",
      left: this.state.dataCrop.originX + "px",
      position: "absolute"
    }

    return (
      <Draggable bounds="parent" onStop={this.onStopDraggable.bind(this)}>
        <div className="cropper" style={style} />
      </Draggable>
    )
  }


  renderToolCrop() {
    return (
      <div>
        <SvgButton handleClick={this.handleZoomCrop.bind(this, true)} id={"crop-in"} />
        <SvgButton handleClick={this.handleZoomCrop.bind(this, false)} id={"crop-out"} />
        <SvgButton handleClick={this.handleCrop.bind(this)} id={"crop"} />

        <SvgButton handleClick={this.handleRotate.bind(this, true)} id={"rotate-right"} />
        <SvgButton handleClick={this.handleRotate.bind(this, false)} id={"rotate-left"} />

        <SvgButton handleClick={this.handleSave.bind(this)} id={"save"} />

        <SvgButton handleClick={this.handleZoomImage.bind(this, true)} id={"zoom-in"} />
        <SvgButton handleClick={this.handleZoomImage.bind(this, false)} id={"zoom-out"} />
      </div>
    )
  }

  onStopDraggable(e, position) {
    var data = {
      x: position.x,
      y: position.y,
      originX: this.state.dataCrop.originX,
      originY: this.state.dataCrop.originY,
      width: this.state.dataCrop.width,
      height: this.state.dataCrop.height
    }

    this.setState({ dataCrop: data })
  }

  handleZoomCrop(enlarge) {
    var dataCrop = this.state.dataCrop;
    if (enlarge) {
      if (((dataCrop["x"] + dataCrop["width"]) < CANVAS_WIDTH) && ((dataCrop["x"] + dataCrop["width"] * SCALE_ZOOM) < CANVAS_WIDTH)) {
        dataCrop["width"] = dataCrop["width"] * SCALE_ZOOM;
        dataCrop["height"] = dataCrop["height"] * SCALE_ZOOM;
      }
    } else {
      dataCrop["width"] = dataCrop["width"] / SCALE_ZOOM;
      dataCrop["height"] = dataCrop["height"] / SCALE_ZOOM;
    }

    this.setState({ dataCrop: dataCrop });
  }

  handleChangeScanner(e) {
    const value = (e.target.value !== "-1") ? e.target.value : null;
    this.setState({ scannerSelected: value });
  }

  fixBinary (bin) {
    var length = bin.length;
    var buf = new ArrayBuffer(length);
    var arr = new Uint8Array(buf);
    for (var i = 0; i < length; i++) {
      arr[i] = bin.charCodeAt(i);
    }
    return buf;
}

  handleClickScan(preview) {
    let dataCrop = this.state.dataCrop;
    ScanActions.scan(preview, this.state.dataHost, { idScanner: this.state.scannerSelected }, true).then((data) => {
      this.urlObjectImage = URL.createObjectURL(new Blob([this.fixBinary(atob(data))]));
      const { context, imageSource } = this.initContextAndImage();
      this.canvas.width = CANVAS_WIDTH;
      this.canvas.height = CANVAS_HEIGHT;
      context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      imageSource.onload = () => {
        context.translate((this.canvas.width - imageSource.width) / 2, (this.canvas.height - imageSource.height) / 2);
        context.drawImage(imageSource, 0, 0, imageSource.width, imageSource.height);
        this.setState({ isScanned: true, imgSize: { w: imageSource.width, h: imageSource.height } });
      }

    }).catch(function (err) {
      console.error(err);
    });
  }


  handleSave() {
    var link = document.createElement("a");
    link.setAttribute("href", this.canvas.toDataURL('image/png'));
    link.setAttribute("download", this.state.fileName);
    link.click();
  }

  initContextAndImage(clear) {
    const imageSource = new Image();
    imageSource.src = this.urlObjectImage;
    return {
      context: this.canvas.getContext('2d'),
      imageSource: imageSource
    }
  }

  handleCrop() {
    const context = this.canvas.getContext('2d');
    // const imageSource = context.getImageData();
    context.clearRect(-1000, -1000, 5000, 5000);
    // imageSource.onload = () => {
      // context.save(); 
      context.drawImage(
        this.canvas,
        this.state.dataCrop.x + this.state.dataCrop.originX,
        this.state.dataCrop.y + this.state.dataCrop.originY,
        this.state.dataCrop.width,
        this.state.dataCrop.height,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      // context.restore(); 
    // }

  }

  handleRotate(isRight) {
    isRight ? this.rotateCount++ : this.rotateCount--;
    this.updateImage();
  }

  updateImage() {
    const { context, imageSource } = this.initContextAndImage();
    context.clearRect(-1000, -1000, 5000, 5000);
    imageSource.onload = () => {
      context.save(); 
      if(this.rotateCount) {
        // context.translate((imageSource.width/2), (imageSource.height/2));
        context.rotate((this.rotateCount * 90) * Math.PI / 180);
      }
      context.scale(this.scale, this.scale);
      context.drawImage(imageSource, -(imageSource.width/2), -(imageSource.height/2));
      context.restore(); 
    }
  }

  handleZoomImage(more) {
    more ? this.zoomImageCount ++: this.zoomImageCount --;
    this.scale = 1;
    if(this.zoomImageCount > 0) {
      this.scale = this.zoomImageCount * SCALE_ZOOM;
    } else if(this.zoomImageCount < 0){
      this.scale = 1 / (Math.abs(this.zoomImageCount) * SCALE_ZOOM);
    }
    this.updateImage();
  }
}