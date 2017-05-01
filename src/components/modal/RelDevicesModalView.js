import React from 'react'
import Modal from 'react-bootstrap-modal'
import { Header, CloseButton } from './parts'

export default class RelDevicesModalView extends React.Component {
  // renderItems () {
  //   return relDevices.map(d =>
  //     <tr key={d.id}>
  //       <td>{d.name}</td>
  //       <td>{d.wanip || d.lanip}</td>
  //     </tr>
  //   )
  // }
  renderItems () {
    const {relDevices} = this.props
    return relDevices.map(d =>
      <tr key={d}>
        <td>{d}</td>
      </tr>
    )
  }
  render () {
    const {onHide} = this.props
    return (
      <Modal show onHide={onHide} aria-labelledby="ModalHeader" className="bootstrap-dialog type-primary modal-w-fit">
        <Header name="Relevant Devices"/>
        <div className="modal-body bootstrap-dialog-message">
          <div style={{height: '500px', overflow: 'auto'}}>
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Name/IP</th>
                </tr>
              </thead>
              <tbody>
              {this.renderItems()}
              </tbody>
            </table>
          </div>
          <CloseButton onClose={onHide} />
        </div>
      </Modal>
    )
  }
}
