import React, { useState } from 'react';
import { LinearProgress, Box, Typography, Container, Fade } from '@mui/material';
import { UploadSection } from './components/UploadSection';
import { PersonaSelector } from './components/PersonaSelector';
import { Questionnaire } from './components/Questionnaire';
import { AnalysisResults } from './components/AnalysisResults';
import { VideoAnalyzer } from './components/VideoAnalyzer';
import { RoutineInput, UserProfile, BiomechanicalAnalysis, PreAnalysisResult, PersonaId, VideoAnalysisResult } from './types';
import { analyzeRoutineWithGemini, preAnalyzeRoutine, analyzeVideoWithGemini } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [routineData, setRoutineData] = useState<RoutineInput | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<PersonaId | null>(null);
  const [preAnalysis, setPreAnalysis] = useState<PreAnalysisResult | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [analysis, setAnalysis] = useState<BiomechanicalAnalysis | null>(null);
  const [videoResult, setVideoResult] = useState<VideoAnalysisResult | null>(null);

  // He diseñado esta función para que el usuario sepa exactamente qué está haciendo mi IA en cada momento
  const myRoutineUploadHandler = async (input: RoutineInput) => {
    if (!input) return;
    setLoading(true);
    setError(null);
    setRoutineData(input);
    setLoadingStatus(input.type === 'video' ? 'Mi IA está escaneando los fotogramas del video...' : 'Leyendo documento...');

    if (input.type === 'video') {
      try {
        const res = await analyzeVideoWithGemini(input.content, input.mimeType || 'video/mp4');
        setVideoResult(res);
        setStep(10);
      } catch (err) {
        console.error(err);
        setError("Mi auditor de video ha fallado. Asegúrate de que el video no supere los 10MB.");
      } finally {
        setLoading(false);
      }
    } else {
      setStep(2);
      setLoading(false);
    }
  };

  const myPersonaSelectHandler = async (id: PersonaId) => {
    if (!routineData) return;
    setLoading(true);
    setSelectedPersona(id);
    setLoadingStatus('Realizando pre-análisis biomecánico...');
    try {
      const res = await preAnalyzeRoutine(routineData, id);
      setPreAnalysis(res);
      setStep(3);
    } catch (err) {
      setError("No he podido procesar el archivo. Intenta con una captura más nítida.");
    } finally {
      setLoading(false);
    }
  };

  const myProfileCompleteHandler = async (profile: UserProfile) => {
    if (!routineData || !selectedPersona) return;
    setLoading(true);
    setLoadingStatus('Generando diagnóstico profundo y optimizaciones...');
    try {
      const res = await analyzeRoutineWithGemini({ ...profile, persona: selectedPersona }, routineData, preAnalysis || undefined);
      setAnalysis(res);
      setUserProfile({ ...profile, persona: selectedPersona });
      setStep(4);
    } catch (err) {
      setError("He tenido un problema al generar el informe. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const myResetHandler = () => {
    setStep(1);
    setLoading(false);
    setRoutineData(null);
    setError(null);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      {/* Mi barra de progreso superior monocromática "Expressive" de MUI v6 */}
      {loading && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2000 }}>
          <LinearProgress color="primary" />
          <Box sx={{ bgcolor: 'rgba(0,0,0,0.8)', color: 'white', px: 2, py: 1, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1 }}>{loadingStatus}</Typography>
          </Box>
        </Box>
      )}
      
      <Container maxWidth="md" sx={{ py: 4 }}>
        <header className="flex items-center justify-between mb-12 border-b border-white/5 pb-6">
          <Box onClick={myResetHandler} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}>
            <Box sx={{ width: 36, height: 36, bgcolor: 'white', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-rounded text-black text-2xl">stat_3</span>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: -1 }}>FitSmart AI</Typography>
          </Box>
        </header>

        <main>
          {error && (
            <Fade in>
              <Box sx={{ mb: 4, p: 3, bgcolor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 4, color: '#f87171', display: 'flex', alignItems: 'center', gap: 2 }}>
                <span className="material-symbols-rounded">error</span>
                <Typography variant="body1" fontWeight={600}>{error}</Typography>
              </Box>
            </Fade>
          )}

          {step === 1 && <UploadSection onComplete={myRoutineUploadHandler} isLoading={loading} />}
          {step === 2 && <PersonaSelector onSelect={myPersonaSelectHandler} isLoading={loading} selectedId={selectedPersona} />}
          {step === 3 && preAnalysis && selectedPersona && <Questionnaire onComplete={myProfileCompleteHandler} preAnalysis={preAnalysis} personaId={selectedPersona} />}
          {step === 4 && analysis && userProfile && <AnalysisResults analysis={analysis} profile={userProfile} onReset={myResetHandler} />}
          {step === 10 && routineData && <VideoAnalyzer videoSrc={routineData.content} isAnalyzing={loading} result={videoResult} onReset={myResetHandler} />}
        </main>
      </Container>
    </Box>
  );
};

export default App;