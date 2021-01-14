import React, {useEffect, useState} from 'react';
import {StyleSheet, View, Text, Button, Image} from 'react-native';

import TrackPlayer from 'react-native-track-player';

// we use these two imports for the slider/progress-bar
import {useTrackPlayerProgress} from 'react-native-track-player';
import Slider from '@react-native-community/slider';

// The best way of keeping track of if the player is playing
// or switching playback_state is by using useTrackPlayerEvents
import {useTrackPlayerEvents} from 'react-native-track-player';
import {
  TrackPlayerEvents,
  STATE_PLAYING,
  PLAYBACK_ERROR,
  STATE_PAUSED,
} from 'react-native-track-player';
// we also need TrackPlayerEvents

// function to initialize the Track Player
const trackPlayerInit = async () => {
  await TrackPlayer.setupPlayer();
  TrackPlayer.updateOptions({
    // this will add the functionality of controlling
    // the tracks outside of the app, check tutorial for more options, like skip track
    stopWithApp: true,
    capabilities: [
      TrackPlayer.CAPABILITY_PLAY,
      TrackPlayer.CAPABILITY_PAUSE,
      TrackPlayer.CAPABILITY_JUMP_FORWARD,
      TrackPlayer.CAPABILITY_JUMP_BACKWARD,
    ], // TrackPlayer.addEventListener in service.js though for this to work
  });
  await TrackPlayer.add({
    // can put add TrackPlayer into seperate function
    id: '78',
    url:
      'https://audio-previews.elements.envatousercontent.com/files/103682271/preview.mp3',
    type: 'default',
    title: 'My Title',
    album: 'My Album',
    artist: 'Rohan Bhatia',
    artwork: 'https://picsum.photos/100',
  });
  // starts setting up the player and will only return true when Trackplayer is loaded and
  // have added the song

  return true;
};

// Subscribing to the following events inside MyComponent
const EVENTS = [
  TrackPlayerEvents.PLAYBACK_STATE,
  TrackPlayerEvents.PLAYBACK_ERROR,
];

// Both these ways work to get the CUrrentTrackID, HOWEVER they cannot be used inside the App

const getCurrentTrackObject = async () => {
  TrackPlayer.getCurrentTrack().then((res) => {
    // when using  getCurrentTrack() sometimes you get null,. and I dont understand why??
    if (res !== null) {
      console.log(
        'This is the id of the current track from inside getCurrentTrackObject():',
      );
      console.log(res);
    } else {
      console.log('Why is this null all of the sudden?');
    }
    return res;
  });
};

// getCurrentTrackObject();

// TrackPlayer.getCurrentTrack().then((value) => console.log(value));

export default function App() {
  //state to manage whether track player is initialized or not
  const [isTrackPlayerInit, setisTrackPlayerInit] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);

  // will go between value of 0 and 1
  const [sliderValue, setSliderValue] = useState(0);

  // isSeeking will only be set to true when the slider is manually moved
  // (when the user is seeking)
  const [isSeeking, setIsSeeking] = useState(false);

  //useTrackPlayerProgress is a hook which provides the current position and duration of the track player.
  //These values will update every 1000ms
  const {position, duration} = useTrackPlayerProgress(1000); // default is 1000ms

  // use a timer-state
  const [songTime, setSongTime] = useState(0); // in seconds

  const [currentTrack, setCurrentTrack] = useState({}); // important to initialize this as an object else we get errors from finding image and stuff

  const updatePlayingTrack = async () => {
    const current_id = await TrackPlayer.getCurrentTrack();
    if (current_id) {
      const currentTrack = await TrackPlayer.getTrack(current_id);
      setCurrentTrack(currentTrack);
    }
    // if current_id doesnt exist then there is no song playing currently
    // depening on settings should either restart playlist OR stop completely
  };

  //initialize the TrackPlayer when the App component is mounted
  useEffect(() => {
    const startPlayer = async () => {
      let isInit = await trackPlayerInit();
      setisTrackPlayerInit(isInit); // will change when the trackPlayer has initialized
      updatePlayingTrack();
    };

    startPlayer();
  }, []); // first thing done

  useTrackPlayerEvents(EVENTS, (currentEvent) => {
    // with this, if we change the state outside of the app
    // then it will be reflected inside of the app aswell

    // can make this switch
    switch (currentEvent.state) {
      case STATE_PLAYING:
        setIsPlaying(true);
        break;
      case STATE_PAUSED:
        setIsPlaying(false);
        break;
      case PLAYBACK_ERROR:
        console.warn('An error occurred while playing the current track.');
        break;

      //defaultstate??
    }
  });

  //

  useEffect(() => {
    // this is basicly the internal clock, it updates every second
    // Here I should also update the visual timer, within the if-statement

    // if the user isnt currently seeking in the song and pos and dur isnt null
    if (!isSeeking && position && duration) {
      setSliderValue(position / duration);
      // should also show the number like on spotify in text
      setSongTime(Math.floor(position.toFixed(0))); //setSongTime to the position of the song currently
    }
  }, [position, duration]); // when positiona and duration is updated...

  // when the user start to slide
  const slidingStarted = () => {
    // make sure that isSeeking is set to true

    setIsSeeking(true);
  };

  const onSliderChange = (value) => {
    setSongTime(value);
  };

  // when the user has stopped sliding, the value of the slider is added here
  const slidingCompleted = async (value) => {
    await TrackPlayer.seekTo(value * duration); // make the track player seekTo the value*duration
    // because value is between 0 and 1
    // wait for the user to let go of slider

    setSliderValue(value); // and setSliderValue to that

    setIsSeeking(false); // set seeking to false
  };

  const onPlayButtonPressed = () => {
    if (!isPlaying) {
      TrackPlayer.play();
      setIsPlaying(true);
    } else {
      TrackPlayer.pause();
      setIsPlaying(false);
    }
  };

  /**
   * 1) Add Text for Time, check pomodoro clock for logic
   * 2) add stylings from website
   *
   * 3) If we ever get back a null value from TrackPlayer.getCurrentTrack().then((value)
   * 4) then we should try again, because it doesnt seem to be consistent
   *
   *
   *
   * Ive got an idea of making either a useRNTrackPLayer Hook
   * Or just make it part of a context api app,
   * to be able to do dispatches, like
   * Or just have it in one file, maybe easier. I dont need to be able to see
   * it in every screen?
   */

  return (
    <View style={styles.mainContainer}>
      <Button
        title={isPlaying ? 'Pause' : 'Play'}
        onPress={() => onPlayButtonPressed()}
        disabled={!isTrackPlayerInit} // dont allow user to press play before TrackPLayer is Init
      ></Button>
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: currentTrack.artwork,
          }}
          resizeMode="contain"
          style={styles.albumImage}
        />
      </View>
      <Text style={styles.songTitle}>{currentTrack.title}</Text>
      <Text style={styles.artist}>{currentTrack.artist}</Text>
      <Slider
        style={{width: 400, height: 40}}
        minimumValue={0}
        maximumValue={1}
        value={sliderValue}
        onValueChange={(currentValue) =>
          onSliderChange(currentValue * duration)
        }
        minimumTrackTintColor="#111000"
        maximumTrackTintColor="#000000"
        onSlidingStart={slidingStarted}
        onSlidingComplete={slidingCompleted}></Slider>

      <View style={styles.timer}>
        <Text>
          {Math.floor(songTime.toFixed(0) / 60)
            .toString()
            .padStart(2, '0') +
            ':' +
            (songTime.toFixed(0) % 60).toString().padStart(2, '0')}
        </Text>
        <Text>
          {'-' +
            Math.floor((duration - songTime).toFixed(0) / 60)
              .toString()
              .padStart(2, '0') +
            ':' +
            ((duration - songTime).toFixed(0) % 60).toString().padStart(2, '0')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#EDEDED',
  },
  imageContainer: {
    flex: 0.5,
    justifyContent: 'center',
  },
  detailsContainer: {
    flex: 0.05,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsContainer: {
    flex: 0.45,
    justifyContent: 'flex-start',
  },
  albumImage: {
    width: 250,
    height: 250,
    alignSelf: 'center',
    borderRadius: 40,
  },
  progressBar: {
    height: 20,
    paddingBottom: 90,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  artist: {
    fontSize: 14,
  },
  timer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
