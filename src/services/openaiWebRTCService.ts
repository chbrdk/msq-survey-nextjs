/**
 * OpenAI Realtime API via WebRTC
 * Browser-compatible implementation using ephemeral tokens
 */

import { useVoiceStore } from '../stores/voiceStore';

export class OpenAIWebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private mediaStream: MediaStream | null = null;
  private isConnected = false;
  private isDataChannelReady = false;
  
  // Session configuration
  private sessionConfig = {
    model: 'gpt-4o-realtime-preview-2024-12-17',
    modalities: ['text', 'audio'],
    voice: 'alloy',
    instructions: `You are conducting the MSQ Workflow Survey - a professional interview about work processes and automation opportunities across MSQ agencies.

Your role:
- Read survey questions naturally and conversationally
- Listen to responses and acknowledge them briefly
- Help clarify questions if the user is confused
- Keep the conversation professional yet friendly
- For percentage questions, confirm the numbers you hear (e.g., "I heard 25 percent for that activity, is that correct?")

Remember:
- This survey maps workflows to identify AI automation opportunities
- Responses are confidential and focused on processes, not performance
- Be encouraging and make the user feel comfortable sharing details about their work`,
    input_audio_format: 'pcm16',
    output_audio_format: 'pcm16',
    turn_detection: {
      type: 'server_vad' as const,
      threshold: 0.5,
      prefix_padding_ms: 300,
      silence_duration_ms: 700
    },
    input_audio_transcription: {
      model: 'whisper-1'
    }
  };
  
  constructor() {
    // No API key needed - tokens come from backend
  }
  
  /**
   * Create ephemeral token from backend API
   * This keeps the API key secure on the server
   */
  private async createEphemeralToken(): Promise<string> {
    const response = await fetch('/api/voice/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.sessionConfig.model,
        voice: this.sessionConfig.voice,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create ephemeral token: ${error.error || response.statusText}`);
    }
    
    const data = await response.json();
    return data.token;
  }
  
  /**
   * Connect to OpenAI Realtime API via WebRTC
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('Already connected');
      return;
    }
    
    try {
      console.log('🔄 Connecting to OpenAI Realtime API via WebRTC...');
      
      // Step 1: Get ephemeral token
      const ephemeralToken = await this.createEphemeralToken();
      console.log('✅ Ephemeral token created');
      
      // Step 2: Create RTCPeerConnection
      this.peerConnection = new RTCPeerConnection();
      
      // Step 3: Add local microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaStream = stream;
      
      stream.getTracks().forEach(track => {
        this.peerConnection!.addTrack(track, stream);
      });
      
      console.log('✅ Microphone stream added');
      
      // Step 4: Create data channel for messages
      this.dataChannel = this.peerConnection.createDataChannel('oai-events');
      
      this.dataChannel.onopen = () => {
        console.log('✅ Data channel opened');
        this.isDataChannelReady = true;
        this.sendSessionUpdate();
      };
      
      this.dataChannel.onmessage = (event) => {
        this.handleDataChannelMessage(event.data);
      };
      
      // Step 5: Handle remote audio stream
      this.peerConnection.ontrack = (event) => {
        console.log('✅ Received remote audio track');
        
        if (!this.audioElement) {
          this.audioElement = new Audio();
          this.audioElement.autoplay = true;
        }
        
        this.audioElement.srcObject = event.streams[0];
      };
      
      // Step 6: Create and set local description (offer)
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      // Step 7: Send offer to OpenAI and get answer
      const answerResponse = await fetch('https://api.openai.com/v1/realtime', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ephemeralToken}`,
          'Content-Type': 'application/sdp',
        },
        body: offer.sdp,
      });
      
      if (!answerResponse.ok) {
        throw new Error(`Failed to get SDP answer: ${answerResponse.statusText}`);
      }
      
      const answer = {
        type: 'answer' as RTCSdpType,
        sdp: await answerResponse.text(),
      };
      
      await this.peerConnection.setRemoteDescription(answer);
      
      this.isConnected = true;
      console.log('✅ Connected to OpenAI Realtime API via WebRTC!');
      
    } catch (error) {
      console.error('❌ WebRTC connection failed:', error);
      this.handleError(error as Error);
      throw error;
    }
  }
  
  /**
   * Disconnect from OpenAI
   */
  disconnect(): void {
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement = null;
    }
    
    this.isConnected = false;
    console.log('✅ Disconnected from OpenAI');
  }
  
  /**
   * Send session configuration
   */
  private sendSessionUpdate(): void {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') return;
    
    const message = {
      type: 'session.update',
      session: this.sessionConfig
    };
    
    this.dataChannel.send(JSON.stringify(message));
  }
  
  /**
   * Handle incoming messages from data channel
   */
  private handleDataChannelMessage(data: string): void {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'session.created':
        case 'session.updated':
          console.log('✅ Session ready:', message);
          break;
          
        case 'conversation.item.input_audio_transcription.completed':
          // Transcription completed
          const transcript = message.transcript;
          useVoiceStore.getState().setTranscript(transcript);
          console.log('📝 Transcript:', transcript);
          break;
          
        case 'response.audio.delta':
          // Audio is being streamed via WebRTC track, not data channel
          break;
          
        case 'response.done':
          useVoiceStore.getState().setSpeaking(false);
          break;
          
        case 'input_audio_buffer.speech_started':
          useVoiceStore.getState().setListening(true);
          break;
          
        case 'input_audio_buffer.speech_stopped':
          useVoiceStore.getState().setListening(false);
          break;
          
        case 'error':
          console.error('❌ OpenAI error:', message.error);
          this.handleError(new Error(message.error.message));
          break;
          
        default:
          console.log('📨 Message:', message.type);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  }
  
  /**
   * Text-to-Speech: Speak the given text
   */
  async speak(text: string): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }
    
    // Wait for data channel to be ready
    await this.waitForDataChannel();
    
    return new Promise((resolve, reject) => {
      try {
        if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
          reject(new Error('Data channel not open'));
          return;
        }
        
        useVoiceStore.getState().setSpeaking(true);
        
        // Send conversation item with text
        this.dataChannel.send(JSON.stringify({
          type: 'conversation.item.create',
          item: {
            type: 'message',
            role: 'assistant',
            content: [{
              type: 'text',
              text: text
            }]
          }
        }));
        
        // Request response with audio output
        this.dataChannel.send(JSON.stringify({
          type: 'response.create',
          response: {
            modalities: ['audio', 'text']
          }
        }));
        
        // Wait for response to complete
        const checkComplete = () => {
          if (!useVoiceStore.getState().isSpeaking) {
            resolve();
          } else {
            setTimeout(checkComplete, 100);
          }
        };
        
        setTimeout(checkComplete, 100);
        
      } catch (error) {
        useVoiceStore.getState().setSpeaking(false);
        reject(error);
      }
    });
  }
  
  /**
   * Wait for data channel to be ready
   */
  private async waitForDataChannel(maxWait: number = 5000): Promise<void> {
    const startTime = Date.now();
    
    while (!this.isDataChannelReady && (Date.now() - startTime) < maxWait) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (!this.isDataChannelReady) {
      throw new Error('Data channel did not open in time');
    }
  }
  
  /**
   * Speech-to-Text: Listen for user input
   * With WebRTC, audio is automatically captured via the peer connection
   * Server VAD (Voice Activity Detection) handles when to transcribe
   */
  async listen(timeout: number = 30000): Promise<string> {
    if (!this.isConnected) {
      await this.connect();
    }
    
    await this.waitForDataChannel();
    
    return new Promise((resolve, reject) => {
      try {
        useVoiceStore.getState().setListening(true);
        useVoiceStore.getState().resetTranscript();
        
        let timeoutId: ReturnType<typeof setTimeout>;
        let transcriptionReceived = false;
        
        // Set up listener for transcription
        const originalDataChannelHandler = this.dataChannel!.onmessage;
        
        this.dataChannel!.onmessage = (event) => {
          // Call original handler
          if (originalDataChannelHandler && this.dataChannel) {
            originalDataChannelHandler.call(this.dataChannel, event);
          }
          
          try {
            const message = JSON.parse(event.data);
            
            if (message.type === 'conversation.item.input_audio_transcription.completed') {
              transcriptionReceived = true;
              clearTimeout(timeoutId);
              useVoiceStore.getState().setListening(false);
              resolve(message.transcript);
            } else if (message.type === 'input_audio_buffer.speech_stopped') {
              // Speech stopped - commit the buffer
              if (this.dataChannel && this.dataChannel.readyState === 'open') {
                this.dataChannel.send(JSON.stringify({
                  type: 'input_audio_buffer.commit'
                }));
              }
            }
          } catch (error) {
            // Ignore parsing errors
          }
        };
        
        // Don't manually commit - let server VAD detect when user stops speaking
        // The server will send 'input_audio_buffer.speech_stopped' when ready
        
        // Set timeout
        timeoutId = setTimeout(() => {
          if (!transcriptionReceived) {
            useVoiceStore.getState().setListening(false);
            const currentTranscript = useVoiceStore.getState().currentTranscript;
            
            if (currentTranscript) {
              resolve(currentTranscript);
            } else {
              reject(new Error('Listening timeout - no speech detected'));
            }
          }
        }, timeout);
        
      } catch (error) {
        useVoiceStore.getState().setListening(false);
        reject(error);
      }
    });
  }
  
  /**
   * Handle errors
   */
  private handleError(error: Error): void {
    useVoiceStore.getState().setError(error.message);
    console.error('OpenAI WebRTC Error:', error);
  }
}

// Singleton instance
let webRTCInstance: OpenAIWebRTCService | null = null;

export function getOpenAIWebRTCService(): OpenAIWebRTCService {
  if (!webRTCInstance) {
    webRTCInstance = new OpenAIWebRTCService();
  }
  
  return webRTCInstance;
}

