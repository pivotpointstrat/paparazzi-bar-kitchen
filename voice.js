// Paparazzi Bar & Kitchen — voice concierge widget.
// Floating mic button (bottom-left) — talk to the Paparazzi assistant or use
// the live interpreter. Backed by Gemini Live API via the ephemeral-token proxy.

(function () {
  'use strict';

  const WS_BASE = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained';
  const TOKEN_ENDPOINT = '/.netlify/functions/voice-token';
  const SAMPLE_RATE_IN = 16000;
  const SAMPLE_RATE_OUT = 24000;
  const WORKLET_CHUNK = 2048;

  const PERSONA = "You are the voice concierge for Paparazzi Bar & Kitchen, a cozy pub-and-bar restaurant on Riverside in Phnom Penh, Cambodia. Be warm, professional, and concise. Respond in the same language the user speaks (Khmer, English, or others). You may answer questions about hours (Mon-Sat 11am-11pm, closed Sunday), location (179 E0 Preah Sisowath Quay), the menu (international comfort food, steaks, seafood, 24 cocktails at $5, craft beers), reservations (online or by phone 031 777 2840), and the cigar lounge upstairs. If asked for help you cannot give, suggest calling 031 777 2840 rather than guessing.";
  const INTERPRETER_PERSONA = "You are a real-time voice-to-voice interpreter for English and Khmer. Listen to what the user says and translate it into the other language immediately and accurately. Speak only the translation — do not add commentary, explanations, or your own opinions.";
  const VOICE_NAME = 'Aoede';

  // Build widget DOM
  const css = `
  .voice-toggle { position: fixed; bottom: 24px; left: 24px; width: 58px; height: 58px; border-radius: 50%;
    border: none; background: #c9a24a; color: #0f0f0f; cursor: pointer; z-index: 9990;
    display: flex; align-items: center; justify-content: center; font-size: 24px;
    box-shadow: 0 4px 18px rgba(0,0,0,.4); transition: transform .15s; }
  .voice-toggle:hover { transform: scale(1.08); }
  .voice-panel { position: fixed; bottom: 92px; left: 24px; width: 320px; max-width: calc(100vw - 48px);
    background: #161616; border: 1px solid rgba(201,162,74,.25); border-radius: 14px;
    box-shadow: 0 10px 40px rgba(0,0,0,.5); z-index: 9991; overflow: hidden; display: none; flex-direction: column; }
  .voice-header { background: #1e1e1e; padding: 12px 16px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid rgba(201,162,74,.15); }
  .voice-header .voice-title { font-weight: 600; font-size: 14px; flex: 1; color: #f2ede4; }
  .voice-header .voice-close { background: none; border: none; color: #9a938a; font-size: 20px; cursor: pointer; line-height: 1; }
  .voice-modes { display: flex; gap: 6px; padding: 10px 12px 0; }
  .voice-modes button { flex: 1; padding: 7px 0; font-size: 12px; border: 1px solid #333; background: #1e1e1e; border-radius: 999px; cursor: pointer; color: #9a938a; }
  .voice-modes button.active { background: #c9a24a; border-color: #c9a24a; color: #0f0f0f; }
  .voice-talk { display: flex; flex-direction: column; align-items: center; padding: 14px 0 6px; gap: 8px; }
  .voice-mic { width: 64px; height: 64px; border-radius: 50%; border: none; background: #1e1e1e; cursor: pointer;
    display: flex; align-items: center; justify-content: center; font-size: 26px; transition: transform .15s; }
  .voice-mic:hover { transform: scale(1.06); }
  .voice-mic.listening { background: #2a332a; box-shadow: 0 0 0 4px rgba(52,168,83,.25); }
  .voice-mic.speaking { background: #2a2f3a; box-shadow: 0 0 0 4px rgba(66,133,244,.25); }
  .voice-mic.connecting { background: #3a2f1a; }
  .voice-status { font-size: 12px; color: #9a938a; min-height: 16px; }
  .voice-transcript { padding: 0 14px 14px; max-height: 180px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }
  .vmsg { font-size: 13px; line-height: 1.45; }
  .vmsg.user { color: #a8c7fa; }
  .vmsg.model { color: #d8d2c8; }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const toggle = document.createElement('button');
  toggle.className = 'voice-toggle';
  toggle.setAttribute('aria-label', 'Talk to Paparazzi');
  toggle.textContent = '\u{1F3A4}';

  const panel = document.createElement('div');
  panel.className = 'voice-panel';
  panel.innerHTML = `
    <div class="voice-header">
      <span class="voice-title">Paparazzi Voice Concierge</span>
      <button class="voice-close" aria-label="Close">\u00D7</button>
    </div>
    <div class="voice-modes">
      <button data-mode="assistant" class="active">Assistant</button>
      <button data-mode="translate">Interpreter</button>
    </div>
    <div class="voice-talk">
      <button class="voice-mic" aria-label="Start talking">\u{1F3A4}</button>
      <div class="voice-status">Tap to talk</div>
    </div>
    <div class="voice-transcript"></div>
  `;

  document.body.appendChild(toggle);
  document.body.appendChild(panel);

  const micBtn = panel.querySelector('.voice-mic');
  const statusEl = panel.querySelector('.voice-status');
  const transcriptEl = panel.querySelector('.voice-transcript');
  const modeBtns = panel.querySelectorAll('.voice-modes button');

  let mode = 'assistant';
  let ws = null, micStream = null, inputCtx = null, outputCtx = null, workletNode = null;
  let nextPlayAt = 0, isIntentional = false, lastRole = null, lastMsgEl = null;
  let cachedToken = null;

  toggle.addEventListener('click', () => {
    const open = panel.style.display === 'none' || panel.style.display === '';
    panel.style.display = open ? 'flex' : 'none';
    if (open && !cachedToken) prefetchToken();
  });
  panel.querySelector('.voice-close').addEventListener('click', () => { panel.style.display = 'none'; });

  modeBtns.forEach((b) => b.addEventListener('click', () => {
    mode = b.dataset.mode;
    modeBtns.forEach((x) => x.classList.toggle('active', x === b));
    if (ws) stop();
    cachedToken = null;
    if (panel.style.display !== 'none') prefetchToken();
  }));

  async function prefetchToken() {
    try {
      const tRes = await fetch(`${TOKEN_ENDPOINT}?mode=${mode}`);
      const tData = await tRes.json();
      if (tRes.ok && tData.token) cachedToken = tData;
    } catch (_) { cachedToken = null; }
  }

  micBtn.addEventListener('click', () => { if (ws) stop(); else start(); });

  function setStatus(msg, cls) { statusEl.textContent = msg; statusEl.className = 'voice-status' + (cls ? ' ' + cls : ''); }
  function setMic(state, icon) { micBtn.className = 'voice-mic' + (state ? ' ' + state : ''); micBtn.textContent = icon; }

  function appendMsg(role, text) {
    if (role === lastRole && lastMsgEl) { lastMsgEl.textContent += ' ' + text; }
    else {
      const d = document.createElement('div'); d.className = 'vmsg ' + role; d.textContent = text;
      transcriptEl.appendChild(d); lastRole = role; lastMsgEl = d;
    }
    transcriptEl.scrollTop = transcriptEl.scrollHeight;
  }

  async function start() {
    isIntentional = false; lastRole = null; lastMsgEl = null;
    transcriptEl.innerHTML = '';
    appendMsg('model', mode === 'translate' ? 'Speak in English or Khmer — I\u2019ll interpret in real time.' : 'Welcome to Paparazzi Bar & Kitchen. How can I help you?');
    setMic('connecting', '\u23F3'); setStatus('Connecting\u2026');

    try {
      let tData = cachedToken;
      if (!tData) {
        const tRes = await fetch(`${TOKEN_ENDPOINT}?mode=${mode}`);
        tData = await tRes.json();
        if (!tRes.ok || !tData.token) throw new Error(tData.error || 'Could not start session.');
      }
      cachedToken = null;

      ws = new WebSocket(`${WS_BASE}?access_token=${encodeURIComponent(tData.token)}`);

      ws.onopen = () => {
        ws.send(JSON.stringify({
          setup: {
            model: 'models/' + tData.model,
            generation_config: {
              response_modalities: ['AUDIO'],
              speech_config: { voice_config: { prebuilt_voice_config: { voice_name: VOICE_NAME } } }
            },
            realtime_input_config: {
              activity_handling: 'START_OF_ACTIVITY_INTERRUPTS',
              automatic_activity_detection: { disabled: false, start_of_speech_sensitivity: 'START_SENSITIVITY_HIGH', prefix_padding_ms: 100 }
            },
            system_instruction: { parts: [{ text: mode === 'translate' ? INTERPRETER_PERSONA : PERSONA }] }
          }
        }));
      };

      ws.onmessage = async (evt) => {
        const raw = evt.data instanceof Blob ? await evt.data.text() : evt.data;
        let msg; try { msg = JSON.parse(raw); } catch { return; }
        handleMessage(msg);
      };
      ws.onerror = () => { setStatus('Connection error.', 'error'); teardown(); };
      ws.onclose = (e) => { if (isIntentional) return; ws = null; setStatus('Disconnected.', 'error'); teardown(); };
    } catch (err) { setStatus('Error: ' + err.message, 'error'); teardown(); }
  }

  function stop() {
    isIntentional = true; const w = ws; ws = null;
    if (w) w.close(1000, 'user stopped');
    teardown(); setStatus('Tap to talk');
  }

  function handleMessage(msg) {
    if (msg.setupComplete) { openMic(); return; }
    if (!msg.serverContent) return;
    const { modelTurn, turnComplete, interrupted, inputTranscription, outputTranscription } = msg.serverContent;
    if (inputTranscription?.text) appendMsg('user', inputTranscription.text);
    if (modelTurn?.parts) {
      setMic('speaking', '\u{1F50A}'); setStatus('Speaking\u2026');
      for (const part of modelTurn.parts) { if (part.inlineData?.mimeType?.includes('audio/pcm')) enqueueAudio(part.inlineData.data); }
    }
    if (outputTranscription?.text) appendMsg('model', outputTranscription.text);
    if (turnComplete) { setMic('listening', '\u{1F3A4}'); setStatus('Listening\u2026'); }
    if (interrupted) { nextPlayAt = outputCtx ? outputCtx.currentTime : 0; setMic('listening', '\u{1F3A4}'); setStatus('Listening\u2026'); }
  }

  async function openMic() {
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, sampleRate: SAMPLE_RATE_IN, echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      inputCtx = new AudioContext({ sampleRate: SAMPLE_RATE_IN });
      outputCtx = new AudioContext({ sampleRate: SAMPLE_RATE_OUT });
      nextPlayAt = 0; await inputCtx.resume();

      const workletUri = 'data:text/javascript;charset=utf-8,' + encodeURIComponent(
        `class PCMProcessor extends AudioWorkletProcessor{constructor(){super();this._buf=new Float32Array(${WORKLET_CHUNK});this._pos=0;}process(inputs){const ch=inputs[0]?.[0];if(!ch)return true;let i=0;while(i<ch.length){const take=Math.min(this._buf.length-this._pos,ch.length-i);this._buf.set(ch.subarray(i,i+take),this._pos);this._pos+=take;i+=take;if(this._pos===this._buf.length){this.port.postMessage(this._buf.slice());this._pos=0;}}return true;}}registerProcessor('pcm-processor',PCMProcessor);`
      );
      await inputCtx.audioWorklet.addModule(workletUri);

      const source = inputCtx.createMediaStreamSource(micStream);
      workletNode = new AudioWorkletNode(inputCtx, 'pcm-processor');
      workletNode.port.onmessage = (e) => {
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        const pcm = float32ToInt16(e.data);
        const b64 = bufToBase64(pcm.buffer);
        ws.send(JSON.stringify({ realtimeInput: { audio: { data: b64, mimeType: `audio/pcm;rate=${SAMPLE_RATE_IN}` } } }));
      };
      source.connect(workletNode);
      const silentGain = inputCtx.createGain(); silentGain.gain.value = 0;
      workletNode.connect(silentGain); silentGain.connect(inputCtx.destination);

      setMic('listening', '\u{1F3A4}'); setStatus('Listening\u2026');
    } catch (err) { setStatus('Mic error: ' + err.message, 'error'); stop(); }
  }

  function enqueueAudio(base64) {
    if (!outputCtx) return;
    try {
      const raw = atob(base64); const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
      const int16 = new Int16Array(bytes.buffer); const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768.0;
      const buf = outputCtx.createBuffer(1, float32.length, SAMPLE_RATE_OUT);
      buf.getChannelData(0).set(float32);
      const src = outputCtx.createBufferSource(); src.buffer = buf; src.connect(outputCtx.destination);
      const when = Math.max(outputCtx.currentTime, nextPlayAt); src.start(when); nextPlayAt = when + buf.duration;
    } catch (e) {}
  }

  function teardown() {
    if (ws && ws.readyState === WebSocket.OPEN) { try { ws.send(JSON.stringify({ realtimeInput: { audioStreamEnd: true } })); } catch (_) {} }
    if (workletNode) { try { workletNode.disconnect(); } catch (_) {} workletNode = null; }
    if (micStream) { micStream.getTracks().forEach(t => t.stop()); micStream = null; }
    if (inputCtx) { inputCtx.close().catch(() => {}); inputCtx = null; }
    if (outputCtx) { outputCtx.close().catch(() => {}); outputCtx = null; }
    nextPlayAt = 0; setMic('', '\u{1F3A4}');
  }

  function float32ToInt16(f32) {
    const out = new Int16Array(f32.length);
    for (let i = 0; i < f32.length; i++) { const s = Math.max(-1, Math.min(1, f32[i])); out[i] = s < 0 ? s * 32768 : s * 32767; }
    return out;
  }
  function bufToBase64(buffer) {
    const bytes = new Uint8Array(buffer); let s = '';
    for (let i = 0; i < bytes.length; i += 8192) s += String.fromCharCode(...bytes.subarray(i, i + 8192));
    return btoa(s);
  }
})();
