import React from 'react'
import Modal from 'react-bootstrap-modal'
import { showAlert } from '../../../../shared/Alert'

export default class NewIncidentModal extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      img: '/images/adminlogin.png'
    }
  }

  onHide () {
    this.setState({
      open: false
    }, () => {
      this.props.onClose &&
            this.props.onClose(this)
    })
  }

  onClickClose () {
    this.onHide()
  }

  onClickSave () {
    const refs = this.refs
    const input = refs.file
    const name = refs.name.value
    const desc = refs.desc.value
    const severity = refs.severity.value

    if (!name) return showAlert('Please input name.')
    if (input.files.length) {
      let img = input.files[0]

      let formData = new window.FormData()
      formData.append('file', img, img.name)
    } else {
      this.addIncident(name, desc, severity, '')
    }
  }

  addIncident (name, desc, severity, img) {

  }

    // /////////////////////////

  onChangeFile (e) {
    const img = window.URL.createObjectURL(e.target.files[0])
    this.setState({ img })
  }

  render () {
    return (
      <Modal show onHide={this.onHide.bind(this)} aria-labelledby="ModalHeader" className="bootstrap-dialog type-primary">

        <div className="modal-header">
          <h4 className="modal-title bootstrap-dialog-title">
            Add Incident
          </h4>
          <div className="bootstrap-dialog-close-button">
            <button className="close" onClick={this.onClickClose.bind(this)}>×</button>
          </div>
        </div>

        <div className="modal-body bootstrap-dialog-message">
          <div className="row text-center margin-md-bottom">
            <div className="img-input" style={{width: '60px'}}>
              <img src={this.state.img}/>
              <input type="file" accept="image/*;capture=camera" onChange={this.onChangeFile.bind(this)} ref="file"/>
            </div>
          </div>

          <div className="row margin-md-bottom">
            <label className="control-label col-md-3">Name</label>
            <div className="col-md-9">
              <input type="text" className="form-control" ref="name" />
            </div>
          </div>

          <div className="row margin-md-bottom">
            <label className="control-label col-md-3">Description</label>
            <div className="col-md-9">
              <textarea className="form-control" ref="desc" />
            </div>
          </div>

          <div className="row margin-md-bottom">
            <label className="control-label col-md-3 pt-none mb-none">Severity</label>
            <div className="col-md-9">
              <select ref="severity" className="form-control">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
                <option>Audit</option>
              </select>
            </div>
          </div>

          <div className="text-center mb-none">
            <a href="javascript:;" className="btn btn-default btn-sm margin-sm-right" onClick={this.onClickSave.bind(this)}>Add</a>
            <a href="javascript:;" className="btn btn-default btn-sm" onClick={this.onClickClose.bind(this)}>Cancel</a>
          </div>
        </div>
      </Modal>
    )
  }
}
