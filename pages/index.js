import React from 'react';
import IconButton from '@mui/material/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import GitHubIcon from '@mui/icons-material/GitHub';
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import { getFlowerScene } from '../scenes/flowervisualizer';
import { getBarsScene } from '../scenes/barsvisualizer';

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.flowers = []
    this.audioData = {
      audioContext: null,
      mediaSrc: null,
      analyser: null,
      bufferLen: 0,
      signal: null,
      tracks: [
        0,
        182,
        328,
        515,
        646,
        806,
        939,
        1035,
      ],
      lastTrackIndex: 5,
    };
    this.audioLoaded = false;
    this.state = {
      screen: {
        w: 0,
        h: 0,
      },
    },
    this.state = {
      isPaused: true,
    };
    this.currentScene = 'flower';
    this.engine = null;
  }

  startTrack() {
    if (this.audio && !this.audioLoaded) {
      this.audioLoaded = true;
      this.audio.load();
      this.audioData.audioContext = new AudioContext();
      this.audioData.mediaSrc = this.audioData.audioContext.createMediaElementSource(this.audio);
      this.audioData.analyser = this.audioData.audioContext.createAnalyser();
      this.audioData.mediaSrc.connect(this.audioData.analyser);
      this.audioData.analyser.connect(this.audioData.audioContext.destination);
      this.audioData.analyser.fftSize = 256;
      this.audioData.bufferLen = this.audioData.analyser.frequencyBinCount;
      this.audioData.signal = new Uint8Array(this.audioData.bufferLen);
      this.audio.currentTime=this.audioData.tracks[this.audioData.lastTrackIndex];
      this.audio.play();
      this.setState({ isPaused: false });
    }

    if (this.audio && this.audio.paused) {
      this.audio.play();
      this.setState({ isPaused: false });
    }
  }

  pauseTrack() {
    if (this.audio && this.audio.duration > 0 && !this.audio.paused) {
      this.audio.pause();
      this.setState({ isPaused: true });
    }
  }

  nextTrack() {
    if (this.audio && this.audio.duration > 0 && !this.audio.paused) {
      let {
        lastTrackIndex,
        tracks,
      } = this.audioData;
      // next track
      lastTrackIndex = (lastTrackIndex + 1) % tracks.length;
      this.audio.pause();
      this.audio.currentTime = tracks[lastTrackIndex];
      this.audioData.lastTrackIndex = lastTrackIndex;
      // this timeout gives the feeling that something happens
      setTimeout(() => {
        this.audio.play();
      }, 200);
    }
  }

  previousTrack() {
    if (this.audio && this.audio.duration > 0 && !this.audio.paused) {
      let {
        lastTrackIndex,
        tracks,
      } = this.audioData;
      // previous track
      lastTrackIndex -= 1;
      if (lastTrackIndex < 0) lastTrackIndex = tracks.length - 1;
      this.audio.pause();
      this.audio.currentTime = tracks[lastTrackIndex];
      this.audioData.lastTrackIndex = lastTrackIndex;
      // this timeout gives the feeling that something happens
      setTimeout(() => {
        this.audio.play();
      }, 200);
    }
  }

  previousScene() {
    switch(this.currentScene) {
      case 'flower':
        this.currentScene = 'bars';
        break;
      case 'bars':
        this.currentScene = 'flower';
        break;
    }
    this.loadScene();
  }

  nextScene() {
    switch(this.currentScene) {
      case 'flower':
        this.currentScene = 'bars';
        break;
      case 'bars':
        this.currentScene = 'flower';
        break;
    }
    this.loadScene();
  }

  loadScene() {
    if (this.babylonjs) {
      if(!this.engine) {
        this.engine = new BABYLON.Engine(this.babylonjs, true);

        this.engine.runRenderLoop(() => {
          if (this.scene) this.scene.render();
        });

        window.addEventListener("resize", () => {
          if (this.engine) this.engine.resize();
        });

      }

      if (this.scene) this.scene.dispose();
      switch(this.currentScene) {
        case 'flower':
          this.scene = getFlowerScene(this.engine, this.audio, this.audioData);
          break;
        case 'bars':
          this.scene = getBarsScene(this.engine, this.audio, this.audioData);
          break;
      }
    }
  }


  componentDidMount() {
    this.loadScene();
  }

  render() {
    const isPaused = this.state.isPaused;
    let playPauseButton;

    const buttonsStyle = {
      backgroundColor: '#C490E4',
      zIndex: 1000,
      position: 'fixed',
      opacity: 0.6,
      left: '62px',
      top: '20px',
      color: '#000',
    }

    if (!isPaused) {
      playPauseButton = (
        <IconButton size="small" variant="contained"
          style={{
            ...buttonsStyle,
            left: '62px',
          }} onClick={() => this.pauseTrack()}
        >
          <PauseIcon />
        </IconButton>
      );
    } else {
      playPauseButton = (
        <IconButton size="small" variant="contained"
          style={{
            ...buttonsStyle,
            left: '62px',
            left: '62px',
          }} onClick={() => this.startTrack()}
        >
          <PlayArrowIcon />
        </IconButton>
      );
    }
    return (
      <React.Fragment>
        <style jsx global>{`
          html, body {
            background-color: #000;
            margin: 0px;
            padding: 0px;
            min-height: 100vh !important;
            height: 100vh !important;
            min-width: 100% !important;
            width: 100% !important;
          }
          canvas {
            min-height: 100% !important;
            height: 98.5vh !important;
            min-width: 100% !important;
            width: 100% !important;
          }
        `}</style>
        <IconButton size="small" variant="contained"
          style={{ ...buttonsStyle, left: '20px' }} onClick={() => this.previousTrack()}
        >
          <SkipPreviousIcon />
        </IconButton>
        { playPauseButton }
        <IconButton size="small" variant="contained"
          style={{ ...buttonsStyle, left: '104px' }} onClick={() => this.nextTrack()}
        >
          <SkipNextIcon />
        </IconButton>
        <canvas ref={ref => (this.babylonjs = ref)} touch-action="none"></canvas>
        <audio ref={ref => (this.audio = ref)} src="/lofi.mp3"></audio>

        <IconButton size="small" variant="contained"
          style={{
            zIndex: 1000,
            position: 'fixed',
            left: '20px',
            opacity: 0.6,
            top: '51vh',
            color: '#C490E4',
          }} onClick={() => this.nextScene()}
        >
          <ArrowBackIosNewIcon />
        </IconButton>
        <IconButton size="small" variant="contained"
          style={{
            zIndex: 1000,
            position: 'fixed',
            right: '20px',
            opacity: 0.6,
            top: '51vh',
            color: '#C490E4',
          }} onClick={() => this.previousScene()}
        >
          <ArrowForwardIosIcon />
        </IconButton>
        <IconButton size="small" variant="contained"
          target="_blank"
          href="https://github.com/mohammadmohebi/music-visualization"
          style={{
            zIndex: 1000,
            position: 'fixed',
            right: '20px',
            opacity: 0.6,
            top: '20px',
            color: '#C490E4',
          }}
        >
          <GitHubIcon />
        </IconButton>
      </React.Fragment>
    );
  }
}
