import { FlexPlugin } from 'flex-plugin';

import RecordingControls from './components/RecordingControls/RecordingControls'

const PLUGIN_NAME = 'RecordingPauseAndResumePlugin';

export default class RecordingPauseAndResumePlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init(flex, manager) {
    RecordingControls.Setup(flex, manager);
  }

}
