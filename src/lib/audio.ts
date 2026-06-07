"use client";

import { TRACKS } from "./tracks";

class AudioSynth {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private voiceAudio: HTMLAudioElement | null = null;

  private bgMusicIntervalId: any = null;
  private shouldPlayBgMusic: boolean = false;
  private currentChordIdx: number = 0;
  private speakTimeoutId: any = null;

  constructor() {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      // Warm up voices list immediately
      window.speechSynthesis.getVoices();
      if (window.speechSynthesis.addEventListener) {
        window.speechSynthesis.addEventListener("voiceschanged", () => {
          window.speechSynthesis.getVoices();
        });
      }
    }
  }

  private init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    } catch (e) {
      console.warn("AudioContext not supported in this browser:", e);
    }
  }

  private startBgMusicScheduler() {
    if (this.bgMusicIntervalId) return;
    this.init();
    if (!this.ctx) return;

    const chords = [
      [130.81, 164.81, 196.00], // C3, E3, G3 (Major C chord)
      [174.61, 220.00, 261.63], // F3, A3, C4 (Major F chord)
      [196.00, 246.94, 293.66], // G3, B3, D4 (Major G chord)
      [220.00, 261.63, 329.63]  // A3, C4, E4 (Minor A chord)
    ];

    const playChord = () => {
      if (!this.ctx || this.isMuted || !this.shouldPlayBgMusic) return;
      if (this.ctx.state === "suspended") this.ctx.resume();

      const notes = chords[this.currentChordIdx];
      const now = this.ctx.currentTime;
      const duration = 3.5; // Duration of active notes

      notes.forEach((freq) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);

        // Soft ambient slow pad attack
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.008, now + 1.0); // 1 second fade in
        // Soft ambient release
        gain.gain.setValueAtTime(0.008, now + 2.5);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
      });

      this.currentChordIdx = (this.currentChordIdx + 1) % chords.length;
    };

    // Play initial chord and setup loop interval
    playChord();
    this.bgMusicIntervalId = setInterval(playChord, 4000);
  }

  private stopBgMusicScheduler() {
    if (this.bgMusicIntervalId) {
      clearInterval(this.bgMusicIntervalId);
      this.bgMusicIntervalId = null;
    }
  }

  public playBackgroundMusic() {
    this.shouldPlayBgMusic = true;
    if (!this.isMuted) {
      this.startBgMusicScheduler();
    }
  }

  public stopBackgroundMusic() {
    this.shouldPlayBgMusic = false;
    this.stopBgMusicScheduler();
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.voiceAudio) {
      this.voiceAudio.pause();
    }
    if (!muted) {
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      if (this.shouldPlayBgMusic) {
        this.startBgMusicScheduler();
      }
    } else {
      this.stopBgMusicScheduler();
    }
  }

  public getMute() {
    return this.isMuted;
  }

  public playTick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  public playChime() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
    osc1.frequency.exponentialRampToValueAtTime(1046.50, this.ctx.currentTime + 0.25); // C6

    osc2.type = "sine";
    osc2.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.05); // E5
    osc2.frequency.exponentialRampToValueAtTime(1318.51, this.ctx.currentTime + 0.3); // E6

    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.35);
    osc2.stop(this.ctx.currentTime + 0.35);
  }

  public playSwoosh() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.03, this.ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  public playSuccess() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    // Play a major triad arpeggio (C4, E4, G4, C5)
    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    const duration = 0.15;

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.04, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + duration);
    });
  }

  public unlockSpeech() {
    // HTML5 Audio is unlocked naturally by active user gesture clicks
  }

  public setPlaybackRate(rate: number) {
    if (this.voiceAudio) {
      this.voiceAudio.playbackRate = rate;
    }
  }

  public speak(
    text: string,
    rate: number = 1,
    lang: "en" | "hi" | "hinglish" = "en",
    offset: number = 0
  ) {
    if (typeof window === "undefined") return;
    try {
      if (this.speakTimeoutId) {
        clearTimeout(this.speakTimeoutId);
        this.speakTimeoutId = null;
      }

      if (this.voiceAudio) {
        this.voiceAudio.pause();
        this.voiceAudio = null;
      }

      if (this.isMuted || !text) return;

      // Introduce a small delay to debounce and allow previous audio elements to clear
      this.speakTimeoutId = setTimeout(() => {
        try {
          if (this.isMuted) return;

          // Search for matching track and subtitle index based on text
          let matchedTrackId = 1;
          let matchedSubIdx = 1;
          let found = false;
          for (const track of TRACKS) {
            for (let i = 0; i < track.subtitles.length; i++) {
              const sub = track.subtitles[i];
              if (sub.text.en === text || sub.text.hi === text || sub.text.hinglish === text) {
                matchedTrackId = track.id;
                matchedSubIdx = i + 1;
                found = true;
                break;
              }
            }
            if (found) break;
          }

          if (!found) {
            console.warn("Could not find matching pre-recorded audio track for subtitle:", text);
            return;
          }

          const src = `/audio/${lang}/track${matchedTrackId}_sub${matchedSubIdx}.mp3`;
          this.voiceAudio = new Audio(src);
          this.voiceAudio.playbackRate = rate;
          if (offset > 0) {
            this.voiceAudio.addEventListener("loadedmetadata", () => {
              if (this.voiceAudio) {
                this.voiceAudio.currentTime = offset;
              }
            });
          }
          this.voiceAudio.play().catch(err => {
            console.warn("Failed to play voice file:", err);
          });
        } catch (innerErr) {
          console.warn("Audio file speak inner error:", innerErr);
        }
      }, 200);
    } catch (e) {
      console.warn("Audio file speak error:", e);
    }
  }

  public stopSpeaking() {
    if (this.speakTimeoutId) {
      clearTimeout(this.speakTimeoutId);
      this.speakTimeoutId = null;
    }
    if (this.voiceAudio) {
      this.voiceAudio.pause();
      this.voiceAudio = null;
    }
  }

  public pauseSpeaking() {
    // Deprecated due to browser bugs, using stopSpeaking instead
    this.stopSpeaking();
  }

  public resumeSpeaking() {
    // Deprecated due to browser bugs, callers should invoke speak() again
  }

  public isSpeaking(): boolean {
    if (this.voiceAudio) {
      return !this.voiceAudio.paused && !this.voiceAudio.ended;
    }
    return false;
  }
}

export const audioSynth = new AudioSynth();
