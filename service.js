/**
 * This is the code that will run tied to the player.
 *
 * The code here might keep running in the background.
 *
 * You should put everything here that should be tied to the playback but not the UI
 * such as processing media buttons or analytics
 */
import TrackPlayer from 'react-native-track-player';

module.exports = async function () {
  TrackPlayer.addEventListener('remote-play', () => {
    TrackPlayer.play();
  });

  TrackPlayer.addEventListener('remote-pause', () => {
    TrackPlayer.pause();
  });

  // some of these havce to be async
  TrackPlayer.addEventListener('remote-jump-forward', async () => {
    let newPosition = await TrackPlayer.getPosition();
    let duration = await TrackPlayer.getDuration();
    newPosition += 10; // add 10 seconds
    if (newPosition > duration) {
      // jump to the end of the track if adding 10 s would go over the song
      newPosition = duration;
    }
    TrackPlayer.seekTo(newPosition);
  });

  TrackPlayer.addEventListener('remote-jump-backward', async () => {
    let newPosition = await TrackPlayer.getPosition();
    newPosition -= 10;
    if (newPosition < 0) {
      newPosition = 0;
    }
    TrackPlayer.seekTo(newPosition);
  });
}; // exports async function to be able to use it
