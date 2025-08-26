import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Volume2, Languages, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// TypeScript declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
];

export default function VoiceTranslator() {
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionClass();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = sourceLanguage;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInputText(finalTranscript);
          handleTranslate(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Speech Recognition Error",
          description: "Please check your microphone permissions.",
          variant: "destructive"
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [sourceLanguage]);

  const toggleListening = async () => {
    if (!recognitionRef.current) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access to use voice input.",
          variant: "destructive"
        });
      }
    }
  };

  const handleTranslate = async (text: string = inputText) => {
    if (!text.trim()) return;
    
    setIsTranslating(true);
    try {
      // Simulate translation API call - replace with actual translation service
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock translation - in real app, use Google Translate API or similar
      const mockTranslation = `[Translated from ${sourceLanguage} to ${targetLanguage}] ${text}`;
      setTranslatedText(mockTranslation);
      
      toast({
        title: "Translation Complete",
        description: "Text has been successfully translated.",
      });
    } catch (error) {
      toast({
        title: "Translation Error",
        description: "Failed to translate text. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const speakTranslation = () => {
    if (!translatedText) return;
    
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = targetLanguage;
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen p-6 flex items-center justify-center">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-10 h-10 text-neon-cyan animate-pulse" />
            <h1 className="text-4xl md:text-6xl font-bold text-gradient">
              Neural Translator
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Advanced AI-powered voice and text translation
          </p>
        </div>

        {/* Language Selection */}
        <Card className="glass-card p-6 neon-glow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Source Language</label>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger className="bg-background/50 border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-center">
              <Languages className="w-8 h-8 text-neon-cyan" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Target Language</label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className="bg-background/50 border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Input Section */}
        <Card className="glass-card p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={toggleListening}
                size="lg"
                variant={isListening ? "destructive" : "default"}
                className={`${isListening ? 'pulse-animation' : 'neon-glow'} transition-all duration-300`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-5 h-5 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
              
              <div className="flex-1">
                <Input
                  placeholder="Type or speak your text here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="bg-background/50 border-primary/20 text-lg"
                  onKeyPress={(e) => e.key === 'Enter' && handleTranslate()}
                />
              </div>
              
              <Button
                onClick={() => handleTranslate()}
                disabled={!inputText.trim() || isTranslating}
                className="neon-glow"
              >
                {isTranslating ? 'Translating...' : 'Translate'}
              </Button>
            </div>
            
            {isListening && (
              <div className="text-center text-sm text-neon-cyan animate-pulse">
                🎤 Listening... Speak now
              </div>
            )}
          </div>
        </Card>

        {/* Translation Output */}
        {translatedText && (
          <Card className="glass-card p-6 neon-glow">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gradient">Translation</h3>
                <Button
                  onClick={speakTranslation}
                  variant="outline"
                  size="sm"
                  className="border-primary/20 hover:bg-primary/10"
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Play
                </Button>
              </div>
              
              <div className="p-4 rounded-lg bg-background/50 border border-primary/20">
                <p className="text-lg leading-relaxed">{translatedText}</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}