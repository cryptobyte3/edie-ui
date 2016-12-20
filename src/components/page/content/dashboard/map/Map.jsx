import React from 'react'
import {assign, extend} from 'lodash'
import ReactTooltip from 'react-tooltip'
import { connect } from 'react-redux'
import {withRouter} from 'react-router'

import MapCanvas from 'components/shared/map/MapCanvas.jsx'

import MapToolbar from './MapToolbar.jsx'
import DeviceDragLayer from './DeviceDragLayer.jsx'
import DividerLine from './DividerLine.jsx'

import DeviceWizard from 'components/shared/wizard/DeviceWizard.jsx'
import { wizardConfig } from 'components/shared/wizard/WizardConfig.jsx'
import { appendComponent, removeComponent } from 'util/Component.jsx'
import { showConfirm } from 'components/shared/Alert.jsx'

import {
    openDevice, 
    addMapDevice, deleteMapDevice, updateMapDevice,
    addMapLine, deleteMapLine, updateMapLine
} from 'actions/index'

class Map extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            editable: false,
            maximized: false,

            mapId: 0,

            tooltip: null,
            tipLeft: 0,
            tipTop: 0,
            tipWidth: 0,
            tipHeight: 0,

            tipObject: null,

            selectedItem: {},
            dropItem: null,
            dropItemPos: {},

            mapHeight: 520,

            deviceWizardConfig: {},
            deviceWizardVisible: false,
        }

        ///////////////////////////////////////////////
        this.curMapDraw = 1
        this.mapTimer = 0


        this.arrDevices = []
        this.arrLastDevices = []
        this.strLastDevices = ''

        this.arrLines = {}
        this.arrLastLines = {}
        this.strLastLines = ''

        ///////////////////////////////////////////////

        this.mapListener = {
            onObjectSelected:   this.onMapObjectSelected.bind(this),
            onSelectionCleared: this.onMapSelectionCleared.bind(this),

            onMouseDown:        this.onMapMouseDown.bind(this),
            onObjectMoving:     this.onMapObjectMoving.bind(this),
            onObjectMoved:      this.onMapObjectMoved.bind(this),

            onLineUpdate:       this.onMapLineUpdate.bind(this),
            onLineStyleChange:  this.onMapLineStyleChange.bind(this),

            onTextChanged:      this.onMapTextChanged.bind(this),

            onMouseOver:        this.onMapMouseOver.bind(this),
            onMouseOut:         this.onMapMouseOut.bind(this),
            onZoomRect:         this.onMapZoomRect.bind(this),

            onDrop:             this.onDrop.bind(this),
        }

        this.mapEvents = {

            onClickAdd: this.onClickAdd.bind(this),
            onClickEdit: this.onClickEdit.bind(this),
            onClickDelete: this.onClickDelete.bind(this),

            onClickFontSizeUp: this.onClickFontSizeUp.bind(this),
            onClickFontSizeDown: this.onClickFontSizeDown.bind(this),

            onClickAlignLeft: this.onClickAlignLeft.bind(this),
            onClickAlignCenter: this.onClickAlignCenter.bind(this),
            onClickAlignRight: this.onClickAlignRight.bind(this),

            onClickLineWidthInc: this.onClickLineWidthInc.bind(this),
            onClickLineWidthDec: this.onClickLineWidthDec.bind(this),
            onChangeLineColor: this.onChangeLineColor.bind(this),
            onChangeLineType: this.onChangeLineType.bind(this),

            onClickZoomRect: this.onClickZoomRect.bind(this),
            onClickZoomIn: this.onClickZoomIn.bind(this),
            onClickZoomOut: this.onClickZoomOut.bind(this),
            onClickZoomReset: this.onClickZoomReset.bind(this),

            onClickMaximize: this.onClickMaximize.bind(this),

            onClickDeviceItem: this.onClickDeviceItem.bind(this),

        }

        this.resizeTimer = 0

        this.onFullScreenChange = this.onFullScreenChange.bind(this)
        this.onReceiveMapUpdated = this.onReceiveMapUpdated.bind(this)
        this.updateDimensions = this.updateDimensions.bind(this)
        this.onChangeDivider = this.onChangeDivider.bind(this)
        this.onDragEndDivider = this.onDragEndDivider.bind(this)

    }

    getChildContext () {
        return {
            mapId: this.state.mapId
        }
    }
    
    componentDidMount() {

        if (!window.react) window.react = {}
        window.react.map = this

        window.addEventListener("resize", this.updateDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions);
    }

    render() {

        let events = this.mapEvents
        const {tooltip, tipLeft, tipTop, tipWidth, tipHeight, selectedItem,
            dropItem, dropItemPos, editable, maximized, mapHeight} = this.state

        return (
            <div className={"map-row" + (maximized ? " map-maximized" : "") }
                 tabIndex="-1" style={{ outline: 0 }} onKeyUp={this.onMapKeyUp.bind(this)}>
                <div className="panel panel-default mb-none" id="mapeditdiv">
                    <MapToolbar
                        {...events}
                        {...this.state}
                        selectedItem={selectedItem}
                        ref="toolbar"
                    />

                    <div className="panel-body p-none"
                         style={{height: maximized ? "100%" : (mapHeight + "px"), position: 'relative'}}>
                        <MapCanvas
                            listener={this.mapListener}
                            editable={editable}
                            dragItem={selectedItem}
                            dropItem={dropItem}
                            dropItemPos={dropItemPos}
                            hidden={this.props.hidden}
                            mapDevices={this.props.mapDevices}
                            mapLines={this.props.mapLines}
                            showTraffic={this.props.showTraffic}
                            ref="map"/>
                        <DeviceDragLayer />
                    </div>
                </div>

                {this.renderDeviceWizard()}
            </div>
        )
    }

    renderDeviceWizard() {
        if (!this.state.deviceWizardVisible) return null

        const {options, callback, closeCallback} = this.state.deviceWizardConfig

        var extra = {
            mapid: this.props.selectedMap.id,
            x: options.x,
            y: options.y,
            width: options.width,
            height: options.height,
            fatherid: options.fatherid || 0,
            timeout: 60000,
            image: options.imgName
        };

        var config = {
            fatherid: options.fatherid || 0,
            mapid: this.props.selectedMap.id,
        };


        return (
            <DeviceWizard
                deviceType={options.type}
                onClose={() => {
                    this.setState({deviceWizardVisible: false})
                    closeCallback && closeCallback()
                }}
                title={options.title}
                monitors={options.monitors}
                extraParams={extra}
                configParams={config}
                onFinish={this.onFinishAddWizard.bind(this, callback)}
            />
        )

    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onMapKeyUp(e) {
        console.log(e.key)
        if (e.key == 'Escape') {
            if (this.state.editable) {
                this.onClickEdit()
                this.refs.toolbar.hideDeviceMenu()
            }
        }

    }

    onUserInfoLoaded(user) {
    }

    getMap(force) {

        this.curMapDraw++;
        let callDraw = this.curMapDraw;

        let currentmap = this.state.mapId;
        if (typeof currentmap === 'object') {
            console.error("Found object for map id.");
            console.log(currentmap);
            return;
        }

        $('.option.loader').show();
        $('.option.mapalert').hide();


        let callLoadMap = $.get(Api.dashboard.getDevicesForMap, {
            mapid: currentmap,
            fatherid: 0,
            sid: this.context.sid
        })

        let callLoadLines = $.get(Api.dashboard.getLineByLine, {
            mapid: currentmap
        })

        return $.when(callLoadMap, callLoadLines).done((resMap, resLines) => {
            if (callDraw != this.curMapDraw) return;

            $('.option.loader').hide();

            //Cancel when device adding
            if(!force && this.state.editable) return;

            //Cancel when map changed;
            if(currentmap != this.state.mapId) return;

            let [arrNewDevices, , xhrMap] = resMap
            let [arrNewLines, , xhrLines] = resLines

            //Devices
            const strNewDevices = xhrMap.responseText
            let mapUpdated = this.strLastDevices != strNewDevices
            this.arrLastDevices = this.arrDevices
            if (mapUpdated) {
                this.arrDevices = arrNewDevices
                this.strLastDevices = strNewDevices
            }

            //Lines
            const strNewLines = xhrLines.responseText
            let connUpdated = this.strLastLines != strNewLines
            this.arrLastLines = this.arrLines
            if(connUpdated) {
                this.strLastLines = strNewLines
                //this.arrLines = arrNewLines

                this.arrLines = {}//assign({}, this.arrLastLines)
                $.each(arrNewLines, (i, item) => {
                    this.arrLines[item.lineId] = {
                        "id":				item.id,
                        "type":				item.type,

                        "fromDeviceid": 	item.fromDevice,
                        "fromPoint": 		item.fromPoint,
                        "toDeviceid": 		item.toDevice,
                        "toPoint": 			item.toPoint,

                        "linecolor":		item.linecolor,
                        "linewidth":		item.linewidth,
                    }
                })
            }

            //Draw
            if (mapUpdated || connUpdated)
                this.drawMap(this.arrDevices, this.arrLines, this.arrLastDevices, this.arrLastLines, force);

        }).fail(() => {

            if (callDraw != curMapDraw) return;

            $('.option.loader').hide();
            $('.option.mapalert').show();

        }).always(() => {

            //if (!this.state.editable) this.enqueueMapLoad()
        })
    }

    enqueueMapLoad() {

        clearTimeout(this.mapTimer)
        // this.mapTimer = setTimeout(() => {
        //
        //     this.getMap()
        //
        // }, 100/*this.props.drawMapInterval*/)

    }

    drawMap(deviceData, lineData, prevDeviceData, prevLineData, force) {
        const refMap = this.getDivMap();
        if (!refMap) return

        refMap.drawMap(deviceData, lineData, prevDeviceData, prevLineData, force, () => {
            emit(EVENTS.MAP_LOADED)
        })
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    getDivMap() {
        return this.refs.map.getDecoratedComponentInstance()
        // return this.refs.map
    }

    getCanvasMap() {
        return this.getDivMap().getMapObject()
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onMapObjectSelected(cmap, obj) {
        this.refs.toolbar.setState({
            cmap: cmap,
            selectedObj: obj
        })
    }

    onMapSelectionCleared() {
        this.refs.toolbar.setState({
            selectedObj: null
        })
    }

    onMapMouseDown(map, obj) {

        if (this.state.maximized) {
            this.setState({maximized: false})
        }

        this.props.openDevice(obj.data)
        // emit(EVENTS.MAP_DEVICE_CLICKED, obj.data)
        this.props.router.push('/device/')

    }

    onMapObjectMoving() {

    }

    onMapObjectMoved (map, options, type) {
        if (!options) return;

        // options.mapid = this.state.mapId;
        // options.fatherid = options.fatherid || 0;

        return this.moveMapItem(map, options, type);
    }

    onMapLineUpdate(lineObj, callback) {
        let lineId = lineObj.id;

        if (!lineId) {
            let props = {
                mapid: this.props.selectedMap.id,
                line: {
                    from: lineObj.startObj.id,
                    fromPoint: lineObj.startPoint,
                    to: lineObj.endObj.id,
                    toPoint: lineObj.endPoint,
                }
            }

            this.props.addMapLine(props, (res) => {
                if (res) lineObj.id = res.id
            })
        } else {
            let con = this.findMapLine(lineId)
            if (con){
                const props = extend({}, con, {
                    line: {
                        from: lineObj.startObj.id,
                        fromPoint: lineObj.startPoint,
                        to: lineObj.endObj.id,
                        toPoint: lineObj.endPoint,
                    }
                })

                this.props.updateMapLine(props)
            }
        }

        // if(!lineId) {
        //     var param = {
        //         type: 'line',
        //         name: 'line',
        //         angle: 0,
        //         x : 0,
        //         y : 0,
        //         width : 50,
        //         height : 1,
        //
        //         mapid: this.state.mapId,
        //         fatherid: 0,
        //     };
        //
        //     $.get(Api.deviceadmin.addDevice, param)
        //     .done(res => {
        //         if(!res || !res.success) return;
        //         let obj = res.object;
        //         if (obj.length) obj = obj[0];
        //         lineId = obj.id;
        //
        //         this.arrLines[lineId] = {
        //             fromDeviceid: lineObj.startObj.id,
        //             fromPoint: lineObj.startPoint,
        //             toDeviceid: lineObj.endObj.id,
        //             toPoint: lineObj.endPoint,
        //         }
        //
        //         lineObj.id = lineId;
        //
        //         this.updateLineConnectionDB(lineId);
        //         if (callback) callback(lineId, this.arrLines[lineId]);
        //     });
        // } else {
        //     let con = this.arrLines[lineId];
        //     con.fromDeviceid = lineObj.startObj.id;
        //     con.fromPoint = lineObj.startPoint;
        //     con.toDeviceid = lineObj.endObj.id;
        //     con.toPoint = lineObj.endPoint;
        //
        //     this.updateLineConnectionDB(lineId);
        // }
    }

    onMapLineStyleChange(lineObj, style) {
        var lineId = lineObj.id;
        if (!lineId) return

        $.get(Api.devices.updateLine, {

            lineId: lineId,
            linecolor: style.color,
            linewidth: style.width,

        }).done((res) => {

        })
    }

    onMapTextChanged(map, props, isLabel) {
        this.props.updateMapDevice(props)
        // this.addMapUploading(map, id);
        // $.get(Api.devices.renameDevice, {
        //     id: id,
        //     name: text
        // }).done((res) => {
        //
        // }).always(() =>{
        //     this.removeMapUploading(map, id);
        // })
    }

    onMapMouseOver(map, obj) {

        if (this.state.editable) return

        let tooltip = obj.tooltip || ''
        if (tooltip) tooltip = "<div class='text-center'>" + tooltip + "</div>"
        else if (!this.state.tooltip) return

        let rect = obj.getBoundingRect();
        this.setState({
            tooltip: tooltip,
            tipLeft: rect.left,
            tipTop: rect.top,
            tipWidth: rect.width,
            tipHeight: rect.height,
            tipObject: obj,
        }, () => {
            ReactTooltip.rebuild()
        })
    }

    onMapMouseOut() {

        if (!this.state.tooltip) return
        this.setState({
            tooltip: null
        })
    }

    onMapZoomRect() {

    }

    onDrop(item, offset) {
        var doc = document.documentElement;
        var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
        var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);

        let cmap = this.getCanvasMap()
        let pos = cmap.canvas.getPointer({
            clientX: offset.x + left,
            clientY: offset.y + top
        });
        let {x, y} = pos

        let options = options || {};
        $.extend(options, {
            title: item.title,
            type: item.type,
            imgName: item.img,
            imageUrl: '/externalpictures?name=' + item.img,
            x: x,
            y: y,
            width: 50,
            height: 50,

            monitors: item.monitors
        });

        if ('longhub' == options.type) {
            options.width = 20;
            options.height = 400;
        } else if ('bi-pie' == options.type) {
            options.width = 200;
            options.height = 200;
        } else if ('bi-bar' == options.type) {
            options.width = 200;
            options.height = 200;
        } else if ('bi-line' == options.type) {
            options.width = 200;
            options.height = 200;
        } else if ('usertext' == options.type) {
            options.width = 100;
            options.height = 30;
        }

        options.x -= options.width / 2;
        options.y -= options.height / 2;

        this.setState({
            dropItem: item,
            dropItemPos: offset,
        })

        this.showAddWizard(options, (id, name, data) => {
            const refMap = this.getDivMap()
            let cmap = this.getCanvasMap()
            refMap.addMapItem(cmap, data, () => {

            })
        }, () => {
            this.setState({dropItem: null})
        })
    }

    onClickTooltip() {
        this.onMapMouseDown(null, this.state.tipObject)
        this.setState({tooltip: null})
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onClickAdd(displayMenu) {
        if (displayMenu) {
            if (!this.state.editable) this.onClickEdit()
        } else {
            if (this.state.editable) this.onClickEdit()
        }

        this.setState({
            selectedItem: {},
        })
    }

    onClickEdit() {
        let cmap = this.getCanvasMap()
        cmap.zooming && cmap.setZooming(false)

        this.setState({
            editable: !this.state.editable,
            selectedItem: {},
        }, () => {
            if (!this.state.editable)
                this.enqueueMapLoad()
        })
    }

    onClickDelete() {
        let cmap = this.getCanvasMap()
        this.promptRemoveMapItem(cmap)
    }
 
    onClickFontSizeUp() {
        let cmap = this.getCanvasMap()
        cmap.changeFontSize(true);
    }

    onClickFontSizeDown() {
        let cmap = this.getCanvasMap()
        cmap.changeFontSize(false);
    }

    onClickAlignLeft() {
        let cmap = this.getCanvasMap()
        cmap.changeAlign('left');
    }

    onClickAlignCenter() {
        let cmap = this.getCanvasMap()
        cmap.changeAlign('center');
    }

    onClickAlignRight() {
        let cmap = this.getCanvasMap()
        cmap.changeAlign('right');
    }

    onClickLineWidthInc() {
        let cmap = this.getCanvasMap()
        cmap.changeStrokeWidth(true);
    }

    onClickLineWidthDec() {
        let cmap = this.getCanvasMap()
        cmap.changeStrokeWidth(false);
    }

    onChangeLineColor(color) {
        let cmap = this.getCanvasMap()
        cmap.changeStrokeColor(color)

        this.refs.toolbar.setState({cmap})
    }

    onChangeLineType(type, imgUrl, deviceTypeId) {
        let cmap = this.getCanvasMap()
        const lineId = cmap.changeConnectorType(type, imgUrl);
        if (!lineId) return;

        this.changeLineType(lineId, deviceTypeId)
    }

    onClickZoomRect() {
        let cmap = this.getCanvasMap()
        cmap.setZooming(!cmap.zooming)

        this.refs.toolbar.setState({cmap})
    }

    onClickZoomIn() {
        let cmap = this.getCanvasMap()
        cmap.zoomIn()
    }

    onClickZoomOut() {
        let cmap = this.getCanvasMap()
        cmap.zoomOut()
    }

    onClickZoomReset() {
        let cmap = this.getCanvasMap()
        cmap.zoomReset()
    }

    onClickMaximize() {
        // this.setState({maximized: !this.state.maximized}, () => {
        //
        //     globalState.fullscreen = this.state.maximized
        //
        //     if (fullScreen.supportsFullScreen) {
        //         if (this.state.maximized) {
        //             fullScreen.requestFullScreen(document.body)
        //         } else {
        //             fullScreen.cancelFullScreen()
        //         }
        //     } else {
        //         // setTimeout(() => {
        //         //     this.onClickZoomReset()
        //         // }, 200)
        //         window.dispatchEvent(new Event('resize'))
        //     }
        // })
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onReceiveMapUpdated(msg) {
        const mapId = parseInt(msg.content)
        if (!mapId) return

        if (this.state.mapId == mapId && !this.state.editable)
            this.enqueueMapLoad()
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    moveMapItem (map, params, type) {
        if (!params) return true;

        this.props.updateMapDevice(params)
    }

    addMapUploading (map, id) {
        if (!map) return;
        map.addUploading(id);
    }

    removeMapUploading (map, id) {
        if (!map) return;
        map.removeUploading(id);
    }

    promptRemoveMapItem (cmap) {
        if(!cmap) return;
        if(!cmap.editable) return;

        var object = cmap.getSelected();
        if(!object) {
            showAlert("Please select a device to remove.");
            return;
        }

        var item = "";
        var name = "";
        var {data} = object
        if (object.objectType == MapItemType.Device) {
            item = "device";
            name = "Name: " + object.data.name;
        } else if (object.objectType == MapItemType.BI){
            item = "bi";
        } else if (object.objectType == MapItemType.Shape) {
            item = "connection";
            data = this.findMapLine(object.id)
        }

        showConfirm("Click OK to delete.", (btn) => {
            if (btn != 'ok') return;

            if (data) {
                if (object.objectType == MapItemType.Shape) {
                    this.props.deleteMapLine(data)
                } else {
                    this.props.deleteMapDevice(data)
                }
            }
            cmap.removeMapItem(object, true)
        })
    }

    updateLineConnectionDB(lineid) {
        let con = this.arrLines[lineid];
        if(con.id) {
            $.ajax({
                dataType : "json",
                url : "/devices/updateConnection",
                data : {
                    id : con.id,
                    fromDevice: con.fromDeviceid,
                    fromPoint: con.fromPoint,
                    toDevice: con.toDeviceid,
                    toPoint: con.toPoint,
                    lineId: lineid
                },
                success : (data, status, jqXHR) => {
                }
            });
        } else {
            $.ajax({
                dataType : "json",
                url : "/devices/addConnection",
                data : {
                    from: con.fromDeviceid,
                    connectionPoint: con.fromPoint,
                    lineId: lineid
                },
                success : (data, status, jqXHR) => {
                    if(data.success) {
                        con.id = data.info;
                        if(con.toDeviceid)
                            this.updateLineConnectionDB(lineid);
                    } else {
                        console.log('Connection Add Failed!');
                    }
                }
            });
        }
    }

    changeLineType(id, typeid) {
        $.get(Api.deviceadmin.updateLine, {
            id: id,
            type: typeid,
        }).done(() => {

        })
    }

    findMapLine(lineId) {
        let con = this.props.mapLines.filter(u => u.id == lineId)
        if (con.length) return con[0]
        return null
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    showAddWizard(options, callback, closeCallback) {
        if (options.type == 'longhub') {
            const url = Api.deviceadmin.addDevice;
            const param = {
                devicetype: 'longhub',
                name: 'longhub',
                angle: 0,
                x: options.x,
                y: options.y,
                width: options.width,
                height: options.height,
                fatherid: options.fatherid || 0,
                mapid: this.state.mapId,
            };

            $.get(url, param).done((res) => {
                if (!res || !res.success || !res.object.length) {
                    showAlert('Add Failed!');
                    return;
                }

                const data = res.object[0];
                callback && callback(data.id, data.name, data);
            }).always(() => {
                closeCallback && closeCallback()
            });

        } else {
            if (wizardConfig[options.type] == null) {
                showAlert('Unrecognized Type: ' + options.type);
                return;
            }

            this.setState({
                deviceWizardConfig: {
                    options, callback, closeCallback
                },
                deviceWizardVisible: true,
            })

        }
    }

    onFinishAddWizard(callback, res, params) {
        this.props.addMapDevice(params)
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onFullScreenChange() {

    }

    updateDimensions() {
    }

    ////////////////////////////////////////////////////////

    onClickDeviceItem(selectedItem, e) {
        this.setState({ selectedItem }, () => {
        })
    }

    ////////////////////////////////////////////////////////

    onChangeDivider(diffY) {
        let {mapHeight} = this.state
        const oldHeight = mapHeight
        mapHeight += diffY
        if (mapHeight < 250) mapHeight = 250
        this.setState({mapHeight})

        /////////////////
    }

    onDragEndDivider() {
        window.dispatchEvent(new Event('resize'))
    }
}

Map.defaultProps = {
    drawMapInterval: 4000,
    hidden: false,
}

Map.childContextTypes =  {
    mapId: React.PropTypes.number
}

Map.contextTypes = {
    user: React.PropTypes.object,
    sid: React.PropTypes.string,
}

function mapStateToProps(state) {
    const {mapDevices, mapLines, selectedMap} = state.dashboard
    const {showTraffic} = state.settings

    return {mapDevices, mapLines, selectedMap, showTraffic}
}

const actions = {
    openDevice, addMapDevice, deleteMapDevice, updateMapDevice,
    addMapLine, deleteMapLine, updateMapLine
}

export default withRouter(connect(mapStateToProps, actions)(Map))