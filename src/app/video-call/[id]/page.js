'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Clock } from 'lucide-react';

export default function VideoCallPage({ params }) {
  const router = useRouter();
  const { data: userSession } = useSession();
  const [sessionId, setSessionId] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [jitsiLoaded, setJitsiLoaded] = useState(false);
  const jitsiContainer = useRef(null);
  const jitsiApi = useRef(null);
  const scriptLoaded = useRef(false);

  // Ocultar el overflow del body al montar
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    params.then(p => setSessionId(p.id));
  }, [params]);

  useEffect(() => {
    if (sessionId) {
      fetchSession();
    }
    
    // Cleanup cuando se desmonta el componente
    return () => {
      if (jitsiApi.current) {
        jitsiApi.current.dispose();
        jitsiApi.current = null;
      }
    };
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const res = await fetch(`/api/video-sessions/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setSession(data);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error al cargar sesión:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  // Inicializar Jitsi cuando la sesión y el usuario estén listos
  useEffect(() => {
    if (session && userSession && jitsiContainer.current && !loading) {
      console.log('Inicializando Jitsi...', { session, userSession });
      initializeJitsi(session);
    }
  }, [session, userSession, loading]);

  // Polling para verificar si la sesión fue finalizada (solo para pacientes)
  useEffect(() => {
    if (!session || !userSession || userSession.user.role === 'doctor') return;

    const checkSessionStatus = async () => {
      try {
        const res = await fetch(`/api/video-sessions/${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'ended') {
            console.log('El doctor finalizó la consulta');
            if (jitsiApi.current) {
              jitsiApi.current.dispose();
              jitsiApi.current = null;
            }
            alert('El doctor ha finalizado la consulta');
            router.replace('/mis-citas');
          }
        }
      } catch (error) {
        console.error('Error al verificar estado:', error);
      }
    };

    // Revisar cada 3 segundos
    const interval = setInterval(checkSessionStatus, 3000);

    return () => clearInterval(interval);
  }, [session, userSession, sessionId, router]);

  const initializeJitsi = (sessionData) => {
    if (!jitsiContainer.current || jitsiApi.current || !userSession) return;

    // Verificar si el script ya está cargado
    if (window.JitsiMeetExternalAPI) {
      loadJitsiMeet(sessionData);
      return;
    }

    // Cargar el script de Jitsi solo si no se ha cargado antes
    if (scriptLoaded.current) return;
    scriptLoaded.current = true;

    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => {
      setJitsiLoaded(true);
      loadJitsiMeet(sessionData);
    };
    script.onerror = () => {
      console.error('Error al cargar Jitsi');
      alert('Error al cargar el sistema de videollamadas. Por favor recarga la página.');
    };
    document.head.appendChild(script);
  };

  const loadJitsiMeet = (sessionData) => {
    if (!jitsiContainer.current || jitsiApi.current) {
      console.log('Jitsi no puede cargar:', { 
        hasContainer: !!jitsiContainer.current, 
        hasApi: !!jitsiApi.current 
      });
      return;
    }

    try {
      console.log('Creando instancia de Jitsi Meet...');
      const domain = 'meet.jit.si';
      const options = {
        roomName: sessionData.roomId,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainer.current,
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          enableWelcomePage: false,
          prejoinPageEnabled: false,
          disableDeepLinking: true
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone',
            'camera',
            'closedcaptions',
            'desktop',
            'fullscreen',
            'fodeviceselection',
            'hangup',
            'chat',
            'settings',
            'videoquality',
            'filmstrip',
            'stats',
            'tileview'
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          DEFAULT_REMOTE_DISPLAY_NAME: 'Participante'
        },
        userInfo: {
          displayName: userSession?.user?.name || 'Usuario'
        }
      };

      console.log('Opciones de Jitsi:', options);
      jitsiApi.current = new window.JitsiMeetExternalAPI(domain, options);
      console.log('Jitsi API creada exitosamente');

      // Eventos
      jitsiApi.current.addListener('videoConferenceJoined', () => {
        console.log('Usuario se unió a la conferencia');
        updateSessionStatus('join');
      });

      jitsiApi.current.addListener('readyToClose', () => {
        console.log('Listo para cerrar');
        handleEndCall();
      });

      jitsiApi.current.addListener('participantJoined', (participant) => {
        console.log('Participante se unió:', participant);
      });
    } catch (error) {
      console.error('Error al inicializar Jitsi:', error);
      alert('Error al iniciar videollamada: ' + error.message);
    }
  };

  const updateSessionStatus = async (action) => {
    try {
      await fetch(`/api/video-sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    }
  };

  const handleEndCall = async () => {
    try {
      const res = await fetch(`/api/video-sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'end' })
      });

      if (res.ok) {
        const data = await res.json();
        
        // Limpiar Jitsi antes de navegar
        if (jitsiApi.current) {
          jitsiApi.current.dispose();
          jitsiApi.current = null;
        }

        // Si es doctor, redirigir a crear historial (usar replace para no volver atrás)
        if (session.doctor._id === data.doctor._id) {
          router.replace(`/doctor/historiales/nuevo?appointmentId=${session.appointment._id}&sessionId=${sessionId}`);
        } else {
          router.replace('/mis-citas');
        }
      }
    } catch (error) {
      console.error('Error al finalizar:', error);
    }
  };

  // Timer para duración
  useEffect(() => {
    if (!session || session.status !== 'active') return;

    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(session.startedAt);
      const diff = Math.floor((now - start) / 1000); // segundos
      setDuration(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center m-0 p-0">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Cargando videollamada...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center m-0 p-0">
        <div className="text-center text-white">
          <p>Sesión no encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 m-0 p-0 flex flex-col" style={{ overflow: 'hidden' }}>
      {/* Header compacto - NO flotante */}
      <div 
        className="flex-shrink-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-6 py-3 flex items-center justify-between shadow-lg border-b border-gray-700"
        style={{ zIndex: 10 }}
      >
        <div className="text-white">
          <h1 className="text-base font-semibold">Consulta Virtual</h1>
          <p className="text-xs text-gray-400">
            {session?.patient?.name} - {session?.appointment?.appointmentType}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-white bg-gray-700/60 px-3 py-1.5 rounded-lg">
            <Clock className="w-4 h-4" />
            <span className="font-mono text-sm font-semibold">{formatDuration(duration)}</span>
          </div>
          <button
            onClick={handleEndCall}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-md font-semibold text-sm"
          >
            <PhoneOff className="w-4 h-4" />
            Finalizar Consulta
          </button>
        </div>
      </div>

      {/* Video Container - Ocupa el resto del espacio */}
      <div className="flex-1 relative m-0 p-0">
        <div ref={jitsiContainer} className="w-full h-full" style={{ margin: 0, padding: 0 }} />
      </div>
    </div>
  );
}
