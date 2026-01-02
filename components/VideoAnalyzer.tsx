import React, { useEffect, useRef } from 'react';
import { Box, Typography, Button, Paper, Divider, Fade } from '@mui/material';
import { VideoAnalysisResult } from '../types';

interface VideoAnalyzerProps {
  videoSrc: string;
  isAnalyzing: boolean;
  result: VideoAnalysisResult | null;
  onReset: () => void;
}

export const VideoAnalyzer: React.FC<VideoAnalyzerProps> = ({ videoSrc, isAnalyzing, result, onReset }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // He configurado este efecto para que mi video empiece a reproducirse automáticamente al cargar
  useEffect(() => {
    if (videoRef.current && videoSrc) {
      videoRef.current.play().catch(() => {
        console.log("Mi navegador bloqueó el autoplay, esperando interacción.");
      });
    }
  }, [videoSrc]);

  // Use deeply safe optional chaining for feedback properties
  // result?.feedback.type throws if result is {} because feedback is undefined.
  // result?.feedback?.type is the safe way to chain properties.
  const isCorrection = result?.feedback?.type === 'correction';

  return (
    <Box className="animate-enter" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <Box sx={{ 
        position: 'relative', 
        width: '100%', 
        maxWidth: 400, 
        aspectRatio: '9/16', 
        bgcolor: '#000', 
        borderRadius: '48px', 
        overflow: 'hidden',
        border: '8px solid #1e1e21',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
      }}>
        {/* Aquí cargo mi video analizado */}
        <video 
          ref={videoRef} 
          src={videoSrc && videoSrc.startsWith('data:') ? videoSrc : `data:video/mp4;base64,${videoSrc}`} 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover" 
        />
        
        {isAnalyzing && (
          <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, textAlign: 'center' }}>
            <Box sx={{ width: 48, height: 48, border: '4px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin mb-4" />
            <Typography variant="h6" fontWeight={800} color="white">ESCANEANDO VECTOR DE FUERZA</Typography>
          </Box>
        )}

        {result && !isAnalyzing && (
          <Box sx={{ position: 'absolute', bottom: 32, left: 24, right: 24, p: 3, bgcolor: 'rgba(255,255,255,0.95)', borderRadius: 6, color: '#000', backdropFilter: 'blur(10px)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 2 }}>
              <Box>
                <Typography variant="overline" sx={{ opacity: 0.6, fontWeight: 900 }}>REPS</Typography>
                <Typography variant="h3" fontWeight={900}>{result.repCount || 0}</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="overline" sx={{ opacity: 0.6, fontWeight: 900 }}>SCORE</Typography>
                <Typography variant="h5" fontWeight={900}>{result.confidence || 0}%</Typography>
              </Box>
            </Box>
            <Box sx={{ height: 4, width: '100%', bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ height: '100%', bgcolor: '#000', width: `${result.confidence || 0}%` }} />
            </Box>
          </Box>
        )}
      </Box>

      {result && !isAnalyzing && result.feedback && (
        <Fade in timeout={800}>
          <Paper sx={{ width: '100%', maxWidth: 400, p: 4, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 800, color: isCorrection ? '#fca5a5' : '#94a3b8' }}>
              {isCorrection ? 'CORRECCIÓN REQUERIDA' : 'OPTIMIZACIÓN TÉCNICA'}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 4 }}>
              {result.feedback.text}
            </Typography>
            <Button 
              fullWidth 
              variant="contained" 
              onClick={onReset}
              sx={{ py: 2.5, borderRadius: 10, bgcolor: 'white', color: 'black', '&:hover': { bgcolor: '#e2e8f0' } }}
            >
              Realizar Nuevo Análisis
            </Button>
          </Paper>
        </Fade>
      )}

      {result && !isAnalyzing && !result.feedback && (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            No se pudo generar feedback específico.
          </Typography>
          <Button 
            variant="contained" 
            onClick={onReset}
            sx={{ py: 1.5, px: 6, borderRadius: 10, bgcolor: 'white', color: 'black', '&:hover': { bgcolor: '#e2e8f0' } }}
          >
            Volver a intentar
          </Button>
        </Box>
      )}
    </Box>
  );
};