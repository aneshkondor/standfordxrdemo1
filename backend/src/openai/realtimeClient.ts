import WebSocket from 'ws';
import * as fs from 'fs';
import * as path from 'path';

// OpenAI Realtime API Configuration
const OPENAI_API_URL = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export class OpenAIRealtimeClient {
  private ws: WebSocket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000; // Start with 1 second

  constructor() {
    if (!OPENAI_API_KEY) {
      console.error('ERROR: OPENAI_API_KEY environment variable is not set');
      throw new Error('OPENAI_API_KEY is required');
    }
  }

  /**
   * Connect to OpenAI Realtime API
   */
  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('Connecting to OpenAI Realtime API...');

        // Create WebSocket connection with proper headers
        this.ws = new WebSocket(OPENAI_API_URL, {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'OpenAI-Beta': 'realtime=v1'
          }
        });

        // Connection opened
        this.ws.on('open', () => {
          console.log('✓ Connected to OpenAI Realtime API');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        });

        // Connection error
        this.ws.on('error', (error) => {
          console.error('✗ OpenAI WebSocket error:', error);
          this.isConnected = false;
          reject(error);
        });

        // Connection closed
        this.ws.on('close', (code, reason) => {
          console.log(`WebSocket closed: ${code} - ${reason}`);
          this.isConnected = false;
          this.handleReconnect();
        });

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  /**
   * Handle reconnection with exponential backoff
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`);

      setTimeout(() => {
        this.connect().catch(err => {
          console.error('Reconnection failed:', err);
        });
      }, delay);
    } else {
      console.error('Max reconnection attempts reached. Please restart the server.');
    }
  }

  /**
   * Send a message to OpenAI WebSocket
   */
  public send(message: any): void {
    if (!this.ws || !this.isConnected) {
      console.error('Cannot send message: WebSocket is not connected');
      throw new Error('WebSocket not connected');
    }

    try {
      const jsonMessage = JSON.stringify(message);
      this.ws.send(jsonMessage);
      console.log(`Sent message: ${message.type}`);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Add message event listener
   */
  public onMessage(callback: (data: any) => void): void {
    if (!this.ws) {
      throw new Error('WebSocket not initialized');
    }

    this.ws.on('message', (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString());
        callback(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
  }

  /**
   * Close the WebSocket connection
   */
  public close(): void {
    if (this.ws) {
      console.log('Closing OpenAI WebSocket connection...');
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  /**
   * Check if connected
   */
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Configure session with persona instructions and voice
   * Step 2: Send Session Configuration
   * @param personaInstructions - Optional persona prompt. If not provided, loads default therapist prompt.
   * @param voice - Optional voice selection for this persona
   * @param temperature - Optional temperature for response variability
   */
  public configureSession(personaInstructions?: string, voice?: string, temperature?: number): void {
    try {
      let instructions: string;
      let selectedVoice = voice || 'alloy';
      let responseTemp = temperature || 0.8;

      if (personaInstructions) {
        // Use provided persona instructions
        instructions = personaInstructions.trim();
        console.log('Using provided persona instructions...');
      } else {
        // Fallback to default therapist prompt
        const promptPath = path.join(__dirname, '../../prompts/therapist_system.txt');
        instructions = fs.readFileSync(promptPath, 'utf-8').trim();
        console.log('Loading default therapist instructions from prompt file...');
      }

      console.log(`Instructions: ${instructions.substring(0, 100)}...`);
      console.log(`Voice: ${selectedVoice}, Temperature: ${responseTemp}`);

      // Send session.update configuration
      const sessionConfig = {
        type: 'session.update',
        session: {
          modalities: ['text', 'audio'],
          instructions: instructions,
          voice: selectedVoice,
          input_audio_format: 'pcm16',
          output_audio_format: 'pcm16',
          input_audio_transcription: {
            model: 'whisper-1'
          },
          turn_detection: {
            type: 'server_vad',
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 200
          },
          temperature: responseTemp,
          max_response_output_tokens: 4096
        }
      };

      this.send(sessionConfig);
      console.log('✓ Session configuration sent successfully');
    } catch (error) {
      console.error('Failed to configure session:', error);
      throw error;
    }
  }

  /**
   * Send audio input to OpenAI
   * Step 3: Implement Audio Input Handler
   */
  public sendAudioInput(audioData: string): void {
    try {
      const message = {
        type: 'input_audio_buffer.append',
        audio: audioData
      };

      this.send(message);
    } catch (error) {
      console.error('Error sending audio input:', error);
      throw error;
    }
  }

  /**
   * Explicitly request the model to generate a response
   * Useful when server-side VAD doesn't auto-trigger replies
   */
  public requestResponse(): void {
    try {
      const message = {
        type: 'response.create'
      };
      this.send(message);
      console.log('Requested new response from OpenAI');
    } catch (error) {
      console.error('Error requesting response:', error);
      throw error;
    }
  }

  /**
   * Cancel any actively generating response (used for barge-in)
   */
  public cancelResponse(): void {
    try {
      const message = {
        type: 'response.cancel'
      };
      this.send(message);
      console.log('Requested cancellation of active response');
    } catch (error) {
      console.error('Error cancelling response:', error);
      throw error;
    }
  }

  /**
   * Commit audio buffer (optional - triggers response if not using VAD)
   */
  public commitAudioBuffer(): void {
    try {
      const message = {
        type: 'input_audio_buffer.commit'
      };

      this.send(message);
      console.log('Audio buffer committed');
    } catch (error) {
      console.error('Error committing audio buffer:', error);
      throw error;
    }
  }

  /**
   * Clear audio buffer
   */
  public clearAudioBuffer(): void {
    try {
      const message = {
        type: 'input_audio_buffer.clear'
      };

      this.send(message);
      console.log('Audio buffer cleared');
    } catch (error) {
      console.error('Error clearing audio buffer:', error);
      throw error;
    }
  }
}
