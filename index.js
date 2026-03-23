import { registerRootComponent } from 'expo';
import { registerWidgetTaskHandler } from 'react-native-android-widget';

import App from './App';
import { widgetTaskHandler } from './widgetTaskHandler';

// Register the Android widget headless task handler.
// Must be called before registerRootComponent so the task is available
// even when the app process is started in headless (background) mode.
registerWidgetTaskHandler(widgetTaskHandler);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
