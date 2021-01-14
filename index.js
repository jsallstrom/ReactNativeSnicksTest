/**
 * @format
 */

import {Navigation} from 'react-native-navigation';

import App from './App';
import {name as appName} from './app.json';

import TrackPlayer from 'react-native-track-player';

Navigation.registerComponent(appName, () => App);
Navigation.events().registerAppLaunchedListener(() => {
  Navigation.setRoot({
    root: {
      stack: {
        children: [
          {
            component: {
              name: appName,
            },
          },
        ],
      },
    },
  });
});

// add this line to register the TrackPlayer
// Now we can use the track player in any file in the app.
TrackPlayer.registerPlaybackService(() => require('./service.js'));
