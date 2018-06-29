import React from 'react';
import * as ReactDom from 'react-dom';
import Draggable from 'react-draggable'; // The default
import { ScanActions } from "../actions/scan";
import { SvgButton } from "./svg-button";

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;
const SCALE_ZOOM = 1.5;


export class App extends React.Component {

  constructor(props) {
    super(props);

    this.rotateCount = 0;
    this.zoomImageCount = 0;

    this.state = {
      dataOptions: {},
      dataCrop: { originX: 10, originY: 10, width: 200, height: 200 },
      scannerSelected: null,
      inProgress: false,
      isScanned: false,
      isScanning: false,
      fileName: "image.png",
      svgClass: "button-svg"
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
        ScanActions.getScanners(this.state.dataHost).then((scanners) => {
          this.setState({ dataOptions: scanners });
        })
      });
    }
  }

  /**
   * 
   */
  render() {

    const divStyle = {
      position: 'relative',
      // width: CANVAS_WIDTH + "px",
      // height: CANVAS_HEIGHT + "px"
    };

    const canvasProps = {
      id: "canvas",
      // width: CANVAS_WIDTH + "px",
      // height: CANVAS_HEIGHT + "px",
      ref: this.registerCanvas.bind(this)
    }

    return (
      <div className="hornet-scanner">
        <div className="form">
          <div className="select-area">{this.renderListScanners()}</div>
          <div className="buttons-area">{this.state.scannerSelected && this.renderActionButtons()}</div>
        </div>
        <div className="hornet-box image-renderer" style={divStyle}>
          <canvas {...canvasProps}/>
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
        options.push(<option value={index} key={"list-scanner-" + index}>{option}</option>)
      })
    }

    return (
      <select onChange={this.handleChangeScanner.bind(this)}>
        {options}
      </select>);
  }

  /**
   * Rendu des boutons d'action scanner
   */
  renderActionButtons() {
    return (
      <div className="element">
        <div id="actions">
          <button title="Preview" onClick={this.handleClickScan.bind(this, true, false)} id="preview" className="action" disabled={this.state.isScanning}>Scan full</button>
          <button title="Scanner" onClick={this.handleClickScan.bind(this, false, true)} id="scanner" className="action" disabled={this.state.isScanning}>Scan short</button>
        </div>
      </div>
    );
  }

  /**
   * Rendu de la zone de crop
   */
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

  /**
   * Rendu des boutons d'action de l'éditeur
   */
  renderToolCrop() {
    return (
      <div>
        <SvgButton handleClick={this.handleZoomCrop.bind(this, true)} id={"crop-in"} svgClass={this.state.svgClass}/>
        <SvgButton handleClick={this.handleZoomCrop.bind(this, false)} id={"crop-out"} svgClass={this.state.svgClass}/>
        <SvgButton handleClick={this.handleCrop.bind(this)} id={"crop"} svgClass={this.state.svgClass}/>

        <SvgButton handleClick={this.handleRotate.bind(this, true)} id={"rotate-right"} svgClass={this.state.svgClass}/>
        <SvgButton handleClick={this.handleRotate.bind(this, false)} id={"rotate-left"} svgClass={this.state.svgClass}/>

        <SvgButton handleClick={this.handleSave.bind(this)} id={"save"} svgClass={this.state.svgClass}/>

        <SvgButton handleClick={this.handleZoomImage.bind(this, true)} id={"zoom-in"} svgClass={this.state.svgClass}/>
        <SvgButton handleClick={this.handleZoomImage.bind(this, false)} id={"zoom-out"} svgClass={this.state.svgClass}/>
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
    let dataCrop = preview ? null : this.state.dataCrop;
    this.setState({ isScanning: true, svgClass: 'button-svg-disabled' });
    ScanActions.scan(preview, this.state.dataHost, { idScanner: this.state.scannerSelected }, dataCrop).then((data) => {
      this.urlObjectImage = URL.createObjectURL(new Blob([this.fixBinary(atob(data.image))]));
      const { context, imageSource } = this.initContextAndImage(true, true);
      this.canvas.width = data.width;
      this.canvas.height = data.height;
      context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      imageSource.onload = () => {
        //context.translate((this.canvas.width - imageSource.width) / 2, (this.canvas.height - imageSource.height) / 2);
        context.drawImage(imageSource, 0, 0);//, imageSource.width, imageSource.height);
        this.setState({ isScanned: true, isScanning: false, svgClass: 'button-svg' });
      }

    }).catch(function (err) {
      console.error(err);
    });
  }

  /**
   * Listener sur la sauvegarde
   */
  handleSave() {
    var link = document.createElement("a");
    link.setAttribute("href", this.canvas.toDataURL('image/png'));
    link.setAttribute("download", this.state.fileName);

    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(function () {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
    }, 0);
  }

  initContextAndImage(clear, reset) {
    const imageSource = new Image();
    imageSource.src = this.urlObjectImage;
    const context = this.canvas.getContext('2d');

    if(clear === true) {
      context.scale(1, 1);
      context.translate(0, 0);
      context.rotate(0);
      if(reset === true) {
        this.rotateCount = 0;
        this.zoomImageCount = 0;
      }
    }

    return {
      context: context,
      imageSource: imageSource
    }
  }

  /**
   * Listener de redimensionnement suivant la sélection
   */
  handleCrop() {
    const { context, imageSource } = this.initContextAndImage(true);
     
       this.urlObjectImage = context.getImageData(this.state.dataCrop.x, this.state.dataCrop.y, this.state.dataCrop.width, this.state.dataCrop.height);

      // affichage dans un autre canvas
      var canvasBis = document.createElement('canvas');
      var contextBis = canvasBis.getContext('2d');
      canvasBis.width = this.state.dataCrop.width;
      canvasBis.height = this.state.dataCrop.height;
      contextBis.putImageData(this.urlObjectImage, 0, 0);
      this.urlObjectImage = canvasBis.toDataURL();

      // reaffichage de l'extract
      context.clearRect(-1000, -1000, 5000, 5000);
      this.initContextAndImage(true, true);
      this.updateImage(true);
    //};
  }

  /**
   * Listener sur la rotation
   * @param {boolean} isRight 
   */
  handleRotate(isRight) {
    isRight ? this.rotateCount++ : this.rotateCount--;
    if(this.rotateCount == 4) {this.rotateCount = 0;}
    if(this.rotateCount == -1) {this.rotateCount = 3;}
    this.updateImage(true);
  }

  /**
   * Listener sur le ZOOM
   * @param {boolean} more 
   */
  handleZoomImage(more) {
    more ? this.zoomImageCount ++: this.zoomImageCount --;
    this.updateImage(true);
  }

  /**
   * Applique les transformations de zoom et rotation
   */
  updateImage(redraw) {
    
    const { context, imageSource } = this.initContextAndImage(true);
    
    // suppression du contenu
    context.clearRect(-1000, -1000, 5000, 5000);
 
    imageSource.onload = () => {
      // sauvegarde du contexte pour le restaurer à la fin des transformations
      context.save(); 

      if(this.zoomImageCount !== 0) {
        var coeffScale = 1;
        if(this.zoomImageCount >= 0) {
          coeffScale = 1 * Math.abs(this.zoomImageCount) * SCALE_ZOOM;
        } else if(this.zoomImageCount < 0){
          coeffScale = 1 / (Math.abs(this.zoomImageCount) * SCALE_ZOOM);
        }
        context.scale(coeffScale, coeffScale);
      }

      if(this.rotateCount !== 0) {
        switch(this.rotateCount) {
          case 1:
            context.translate(imageSource.height, 0);
            break;
          case 2:
            context.translate(imageSource.width, imageSource.height);
            break;
          case 3:
            context.translate(0, imageSource.width);
            break;
        }
        context.rotate( (this.rotateCount * 90) * Math.PI / 180);
        
      }
      if(redraw === true) {
        context.drawImage(imageSource, 0, 0);
      }
      
      // restauration du context
      context.restore(); 
    }
  }

}
