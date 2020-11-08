import React from 'react'
import { Popup } from 'semantic-ui-react'
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined'
import SettingsGroup from './SettingsGroup'

const Settings = () => {
  return (
    <Popup
      trigger={<SettingsOutlinedIcon fontSize={'large'} style={{ marginLeft: 10 }} />}
      hoverable
      position={'top right'}
    >
      <SettingsGroup header={'Transaction Settings'}>
        <span>place holder 1</span>
        <span>place holder 2</span>
      </SettingsGroup>
      <SettingsGroup header={'Interface Settings'}>
        <span>place holder 1</span>
        <span>place holder 2</span>
      </SettingsGroup>
    </Popup>
  )
}

export default Settings
