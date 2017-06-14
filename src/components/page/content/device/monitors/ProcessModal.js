import React, { Component } from 'react'
import {Dialog} from 'material-ui'
import TimeAgo from 'react-timeago'

export default class ProcessModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      runTimes: [],
      children: []
    }

    this.cells = [{
      'displayName': 'RemoteAddress',
      'columnName': 'remoteaddress'
    }, {
      'displayName': 'Port',
      'columnName': 'remoteports'
    }, {
      'displayName': 'State',
      'columnName': 'state',
      'cssClassName': 'width-180'
    }]
  }

  componentWillMount () {
    // $.get(`${ROOT_URL}${Api.incidents.getProcessRunTimes}`, { // eslint-disable-line no-undef
    //   processId: this.props.process.id
    // }).done(res => {
    //   this.setState({
    //     runTimes: res
    //   })
    // })
    //
    // $.get(`${ROOT_URL}${Api.incidents.getProcessChildren}`, { // eslint-disable-line no-undef
    //   processId: this.props.process.id
    // }).done(res => {
    //   this.setState({
    //     children: res
    //   })
    // })
  }

  onHide () {
    this.closeModal()
  }

  closeModal () {
    this.props.closeProcessModal()
  }

  onClickClose () {
    this.closeModal()
  }

  onChildDblClick (item) {
    this.setState({open: false}, () => {
      this.props.onClose &&
            this.props.onClose(this)

      const {onChildClicked} = this.props
      onChildClicked && onChildClicked(item)
    })
  }

  getRunTimes () {
    return [this.props.process.StartTime]
  }

  getChildren () {
    return this.props.processes.filter(p => p.Parent === this.props.process.Name)
  }

  render () {
    const {process} = this.props
    return (
      <Dialog open title="Process">
        <h4>
          Process: {process.Name}
        </h4>

        <div className="row">
          <label className="col-md-2">ProcessID:</label>
          <label className="col-md-10">{process.Id}</label>
        </div>

        <div style={{maxHeight: '200px', minHeight: '50px', overflow: 'auto'}}>
          <table className="table table-hover">
            <thead>
              <tr>
                <th>RemoteAddress</th>
                <th>Port</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
            {process.Connections.map((c, i) =>
              <tr key={i}>
                <td>{c.RemoteAddress}</td>
                <td>{c.RemotePorts}</td>
                <td>{c.State}</td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
        <div className="row">
          <div className="col-md-4">
            <div className="row">
              <label className="col-md-12">Last Run Times</label>
            </div>
            <div style={{height: '150px', overflow: 'auto'}}>
              <table>
                <tbody>{
                  this.getRunTimes().map((item, i) =>
                    <tr key={i}>
                      <td><TimeAgo date={item}/></td>
                    </tr>)
                }
                </tbody>
              </table>
            </div>
          </div>
          <div className="col-md-8">
            <div className="row">
              <label className="col-md-9">Children</label>
              <label className="col-md-3">PID</label>
            </div>
            <div style={{height: '150px', overflow: 'auto'}}>
              <table style={{width: '100%'}}>
                <tbody>{
                  this.getChildren().map((item, i) =>
                    <tr key={`${i}-${item.Id}`} onDoubleClick={this.onChildDblClick.bind(this, item)}>
                      <td width="75%">{item.Name}</td>
                      <td width="25%">{item.Id}</td>
                    </tr>)
                }</tbody>
              </table>
            </div>
          </div>
        </div>
      </Dialog>
    )
  }
}

ProcessModal.defaultProps = {
  onClose: null,
  process: {},
  onChildClicked: null
}
