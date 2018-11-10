/* tslint:disable: member-ordering variable-name */

import * as React from 'react';
import * as Tone from 'tone';
import './App.css';

interface INote {
  play(): void;
}

export default class App extends React.Component<{}, {
  notes: INote[],
  currentNote: number,
  tempo: number,
  beat: number,
  beatMultiplier: number
}> {
  private _synth: any;

  private _interval: any;
  private _currentTempo: number;
  private _currentBeatMultiplier: number;


  private _soundSet = {
    sound1: () => this._synth.triggerAttackRelease("C2", "16n", undefined, .1),
    sound2: () => this._synth.triggerAttackRelease("C3", "16n", undefined, .1),
    sound3: () => this._synth.triggerAttackRelease("C4", "16n", undefined, .1),
    sound4: () => this._synth.triggerAttackRelease("C5", "16n", undefined, .1)
  }

  constructor(props: any) {
    super(props);
    this._synth = new Tone.MembraneSynth().toMaster();

    const tempo = 40;
    const beat = 4;
    const beatMultiplier = 4;
    const notes = this.prepareNotes(beat, beatMultiplier, this._soundSet.sound1, this._soundSet.sound2, this._soundSet.sound3);

    this.state = { notes, tempo, beat, beatMultiplier, currentNote: -1 };
  }

  private prepareNotes(beat: number, beatMultiplier: number, accentSound: () => void, normalSound: () => void, lowSound: () => void): INote[] {
    const result: INote[] = [];

    for (let i = 0; i < beat; ++i) {
      if (i === 0) {
        result.push({ play: accentSound });
      } else {
        result.push({ play: normalSound });
      }

      for (let j = 0; j < beatMultiplier - 1; ++j) {
        result.push({ play: lowSound });
      }
    }

    return result;
  }

  private start = () => {
    if (this._interval) {
      clearInterval(this._interval);
    }

    this._currentTempo = this.state.tempo;
    this._currentBeatMultiplier = this.state.beatMultiplier;

    this._interval = setInterval(() => {
      let currentNote = this.state.currentNote;

      if (++currentNote >= this.state.notes.length) {
        currentNote = 0;
      }

      this.setState({ currentNote });

      this.state.notes[this.state.currentNote].play();

      if (this.state.tempo !== this._currentTempo ||
          this.state.beatMultiplier !== this._currentBeatMultiplier) {
        clearInterval(this._interval);
        this._interval = undefined;

        this.start();
      }
    }, 60000 / (this._currentTempo * this._currentBeatMultiplier));
  }

  private stop = () => {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = undefined;
    }

    this.setState({ currentNote: -1 });
  }

  private onTempoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ tempo: parseInt(e.target.value, 0) });
  }

  private setBeatMultiplier = (beatMultiplier: number) => {
    if (beatMultiplier < 1) { return; }

    const notes = this.prepareNotes(this.state.beat, beatMultiplier, this._soundSet.sound1, this._soundSet.sound2, this._soundSet.sound3);

    this.setState({ beatMultiplier, notes });
  }

  private increaseBeatMultiplier = (delta: number) => {
    this.setBeatMultiplier(this.state.beatMultiplier + delta);
  }

  public render() {
    return (
      <div className="App">
        <div>
          <input type='number' value={this.state.tempo} onChange={this.onTempoChange} />
          <button onClick={() => this.setState({ tempo: this.state.tempo + 10 })}>+</button>
          <button onClick={() => this.setState({ tempo: this.state.tempo - 10 })}>-</button>
        </div>
        <div>
          <input type='number' value={this.state.beatMultiplier} onChange={e => this.setBeatMultiplier(parseInt(e.target.value, 0))} />
          <button onClick={() => this.increaseBeatMultiplier(1)}>+</button>
          <button onClick={() => this.increaseBeatMultiplier(-1)}>-</button>
        </div>
        <div>
          <button onClick={this.start}>Start</button>
          <button onClick={this.stop}>Stop</button>
        </div>
        <div>
          {this.state.notes.map((note, index) =>
            <span style={ index === this.state.currentNote ? { fontWeight: 'bold' } : undefined }>
              { index % this.state.beatMultiplier === 0 ? (index / this.state.beatMultiplier) + 1 : '.' }&nbsp;
            </span>
          )}
        </div>
      </div>
    );
  }
}
