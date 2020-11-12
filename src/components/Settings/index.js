import React from 'react'
import { Popup } from 'semantic-ui-react'
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined'
import SettingsGroup from './SettingsGroup'
import Slippage from './Slippage'
import DarkMode from './DarkMode'

const Settings = () => {
  return (
    <Popup
      trigger={<SettingsOutlinedIcon fontSize={'large'} style={{ marginLeft: 10 }} />}
      hoverable
      position={'top right'}
    >
      <SettingsGroup header={'Transaction Settings'}>
        <Slippage />
      </SettingsGroup>
      <SettingsGroup header={'Interface Settings'}>
        <DarkMode />
      </SettingsGroup>
    </Popup>
  )
}

export default Settings
