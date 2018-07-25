import React from 'react'
import {Field} from 'redux-form'
import AddIcon from '@material-ui/icons/AddCircle'
import DeleteIcon from '@material-ui/icons/Delete'

import {
  FormInput,
  FormSelect,
  Modal,
  SubmitBlock,
  CardPanel
} from 'components/modal/parts'

export default class TestMessageModalView extends React.Component {
  renderContent () {
    const {fields, onClickAdd, onClickDelete} = this.props
    return (
      <CardPanel title="Message" tools={<AddIcon className="link" onClick={onClickAdd}/>}>
        <table className="table table-hover">
          <thead>
          <tr>
            <th>Field</th>
            <th>Value</th>
          </tr>
          </thead>
          <tbody>
          {fields.map((p) =>
            <tr key={p.id}>
              <td className="valign-top">
                <Field name={`param.name${p.id}`} component={FormInput} label="Field"
                       className="valign-top margin-md-right"/>
              </td>
              <td>
                <Field name={`param.value${p.id}`} component={FormInput} label="Value"
                       className="valign-top margin-md-right"/>

                <div className="inline-block valign-top" style={{marginTop: 8}}>
                  <DeleteIcon
                    className="link"
                    onClick={() => onClickDelete(p.id)}/>
                </div>
              </td>
            </tr>
          )}
          </tbody>
        </table>

      </CardPanel>
    )
  }

  render () {
    const {onSubmit, onClickClose} = this.props
    return (
      <Modal title="Test Message" onRequestClose={onClickClose}>
        <form onSubmit={onSubmit}>
          {this.renderContent()}
        </form>
        {this.props.children}
      </Modal>
    )
  }
}