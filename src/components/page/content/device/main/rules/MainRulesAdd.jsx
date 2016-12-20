import React from 'react'
import Dimensions from 'react-dimensions'
import {withRouter} from 'react-router'
import { findIndex, concat } from 'lodash'
import { connect } from 'react-redux'
import Switch from 'react-bootstrap-switch'
import {
    DropdownButton,
    ButtonGroup,
    MenuItem,
    Button
} from 'react-bootstrap'

import {appendComponent, removeComponent} from 'util/Component'

import {ResponsiveInfiniteTable} from 'components/shared/InfiniteTable.jsx'
import IgnoreRuleEditModal from './IgnoreRuleEditModal.jsx'
import SimulatorModal from './SimulatorModal.jsx'
import { showAlert, showPrompt, showConfirm } from 'components/shared/Alert.jsx'
import DeviceWizard from 'components/shared/wizard/DeviceWizard.jsx'
import CopyRuleModal from './CopyRuleModal.jsx'

import MainTabs from '../MainTabs'
import TabPage from 'components/shared/TabPage'
import TabPageBody from 'components/shared/TabPageBody'
import TabPageHeader from 'components/shared/TabPageHeader'

import {fetchDevicePhysicalRules} from 'actions/index'

class MainRulesAdd extends React.Component {
    constructor(props) {
        super(props)
        const {device} = this.props
        this.state = {

            /////////////////////////////////////

            url: Api.rule.getPhysicalRulesNotApplied,
            params: {
                deviceid: device.id,
                ruleCategory: 0,
                severity: '',
            },

            /////////////////////////////////////

            categoryName: '',
            selectedPhysicals: []
        }

        this.cells = [{
            "displayName": "Category",
            "columnName": "categoryName",
        }, {
            "displayName": "Name",
            "columnName": "name",
        }, {
            "displayName": "Severity",
            "columnName": "severity",
            "cssClassName": "text-center",
        }, {
            "displayName": "Origin",
            "columnName": "origin",
            "cssClassName": "text-center",
        }, {
            "displayName": "Version",
            "columnName": "version",
            "cssClassName": "text-center width-80",
        }, {
            "displayName": "Add",
            "cssClassName": "text-left",
            "columnName": "uuid",
            "customComponent": (props) => {
                const checked = this.state.selectedPhysicals.indexOf(props.data) >= 0
                // return <label><input type="checkbox" checked={checked}
                //                      onChange={this.onClickCheck.bind(this, props.data)}/></label>
                return <Switch size="mini" onChange={this.onChangeSwitch.bind(this, props.data)}/>
            },
        }]
    }

    componentWillMount() {
        this.props.fetchDevicePhysicalRules()
    }

    render() {
        const {device} = this.props
        return (
            <TabPage>
                <TabPageHeader title={device.name}>
                    <div className="text-center margin-md-top">
                        <div className="pull-right">
                            <ButtonGroup>
                                <Button onClick={this.onClickAddFromPhysical.bind(this)}>Save</Button>
                            </ButtonGroup>
                        </div>
                    </div>
                </TabPageHeader>

                <TabPageBody>
                    {this.renderTable()}
                </TabPageBody>
            </TabPage>
        )
    }

    renderTable() {

        return (
            <ResponsiveInfiniteTable
                id="rule2"
                cells={this.cells}
                ref="table"
                rowMetadata={{"key": "id"}}
                selectable={false}
                onRowDblClick={this.onRowDblClick.bind(this)}

                useExternal={false}
                data={this.props.physicalRules}
            />
        )

    }

    render2() {

        return (
            <ResponsiveInfiniteTable
                id="rule2"
                url={this.state.url}
                params={this.state.params}
                cells={this.cells}
                ref="table"
                rowMetadata={{"key": "id"}}
                bodyHeight={this.props.containerHeight}
                selectable={false}
                onRowDblClick={this.onRowDblClick.bind(this)}
            />
        )

    }

    onRowDblClick() {

    }

    onClickAddFromPhysical() {
        let selected = this.state.selectedPhysicals
        if(!selected.length) {
            showAlert('Please choose a rule.')
            return
        }

        let calls = []
        selected.forEach(id => {
            calls.push($.get(Api.rule.addDeviceRuleFromPhysical, {
                physicalUuid: id,
                deviceId: this.props.device.id
            }))
        })

        $.when.apply($, calls).done(() => {

        }).fail(() => {
            showAlert("Failed to add.")
        }).always(() => {
            this.setState({
                selectedPhysicals: []
            })
            this.refs.table.refs.wrappedInstance.refresh()
        })
    }

    onClickCheck(id) {
        let {selectedPhysicals} = this.state
        const index = selectedPhysicals.indexOf(id)
        if (index >= 0)
            selectedPhysicals.splice(index, 1)
        else
            selectedPhysicals.push(id)

        this.setState({selectedPhysicals})
    }

    onChangeSwitch(id, state) {
        let {selectedPhysicals} = this.state
        const index = selectedPhysicals.indexOf(id)
        if (index >= 0)
            selectedPhysicals.splice(index, 1)
        else
            selectedPhysicals.push(id)

        this.setState({selectedPhysicals})
    }
}

MainRulesAdd.defaultProps = {}



function mapStateToProps(state) {
    return {
        device: state.dashboard.selectedDevice,
        physicalRules: state.devices.physicalRules
    }
}

export default withRouter(connect(mapStateToProps, {fetchDevicePhysicalRules})(MainRulesAdd))