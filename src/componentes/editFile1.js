import config from '../config';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import {
    Button,
    Typography,
    Box,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress
} from "@mui/material";
import logoArani from '../images/identidadfrontal.jpg';

//Editar Archivos
function FormEditFile1({ reiniciarpantalla, usuarioFiles, usuarioDetalle: usuarioDetallePerfil }) {
    const gContext = useContext(AppContext);

    // Estado local para guardar los datos leídos del DNI (AirParser)
    // Nota: el usuarioDetalle del PERFIL llega por props como usuarioDetallePerfil.
    const [usuarioDetalleDni, set_usuarioDetalleDni] = useState({});

    const [imageFiles1, set_imageFiles1] = useState(false);
    const [cargandoArchivo1, set_cargandoArchivo1] = useState(false);
    const [subidoArchivo1, set_subidoArchivo1] = useState(false);
    const [imagendata1, set_imagendata1] = useState(false);
    const [archivoSeleccionado1, set_archivoSeleccionado1] = useState(null);

    // Modal AirParser
    const [openAirParserModal, set_openAirParserModal] = useState(false);
    const [airParserEstado, set_airParserEstado] = useState('idle'); // 'idle' | 'loading' | 'ok' | 'error'
    const [airParserRespuesta, set_airParserRespuesta] = useState(null);
    const [airParserError, set_airParserError] = useState('');

    useEffect(() => {
        if (openAirParserModal) {
            console.log('[editFile1] Modal AirParser abierto. usuarioDetalle PERFIL:', usuarioDetallePerfil);
            console.log('[editFile1] Modal AirParser abierto. usuarioDetalle DNI:', usuarioDetalleDni);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openAirParserModal]);

    useEffect(() => {
        console.log('[editFile1] usuarioDetalle PERFIL recibido/actualizado:', usuarioDetallePerfil);
    }, [usuarioDetallePerfil]);

    useEffect(() => {
        console.log('[editFile1] usuarioDetalle DNI actualizado:', usuarioDetalleDni);
    }, [usuarioDetalleDni]);

    useEffect(() => {
        console.log('usuarioFiles', usuarioFiles);

        let t19 = usuarioFiles.find(e => e.type === "19");
        if (!/\.eu$/.test(t19?.dir)) {
            if (t19?.dir) set_imageFiles1(`${config.apiUrl}${t19?.dir}`);
        }

        // eslint-disable-next-line
    }, []);

    const AIRPARSER_URL = 'https://app.aranih.com/api/airparser/enviarDNI.php';
    const AIRPARSER_AUTH = 'XEwGAyyYweoqt2Ov7O6jUp9VvBQaqBSLgYzlbjHpTL1dR3I4Xf2cW8fyga7XmHAs';

    function cerrarAirParserModal() {
        // No dejamos cerrar mientras está procesando para evitar estados raros
        if (airParserEstado === 'loading') return;
        set_openAirParserModal(false);
    }

    function continuarDespuesDeRespuesta() {
        // Cierra el modal de resultados y deja el formulario como "subido"
        set_openAirParserModal(false);
    }

    async function subirArchivo1AlPerfil(file) {
        const formData = new FormData();
        formData.append('file1', file);
        formData.append('sid', gContext.logeado?.token);

        console.log('[editFile1] Subiendo archivo1 a putProfileFile.php');
        try {
            console.log('[editFile1] putProfileFile.php FormData entries:', Array.from(formData.entries()));
        } catch (err) {
            console.log('[editFile1] No se pudo listar FormData.entries() para putProfileFile.php');
        }

        const res = await axios.post(`${config.apiUrl}/api/app/putProfileFile.php`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (res?.data?.status === 'OK') {
            set_subidoArchivo1(true);
            return true;
        }

        console.log('[editFile1] putProfileFile.php respuesta no OK:', res?.data);
        return false;
    }

    async function enviarArchivo1(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        set_archivoSeleccionado1(file);

        // Preview local
        set_imagendata1(URL.createObjectURL(file));

        // Abre modal de espera
        set_openAirParserModal(true);
        set_airParserEstado('loading');
        set_airParserRespuesta(null);
        set_airParserError('');

        // Form-data requerido por el nuevo endpoint
        const formData = new FormData();
        formData.append('file', file);

        // Datos del usuario (desde el perfil)
        const payloadUsuario = {
            client_id: usuarioDetallePerfil?.customer_id,
            identidad: usuarioDetallePerfil?.person_code,
            nombre: usuarioDetallePerfil?.realname,
            apellido: usuarioDetallePerfil?.midname2,
        };

        // Adjuntar campos al FormData (solo si existen)
        Object.entries(payloadUsuario).forEach(([key, value]) => {
            if (value !== undefined && value !== null && String(value).trim() !== '') {
                formData.append(key, value);
            }
        });

        console.log('[editFile1] Enviando a enviarDNI.php payloadUsuario:', payloadUsuario);
        try {
            console.log('[editFile1] FormData enviarDNI.php entries:', Array.from(formData.entries()));
        } catch (err) {
            // Algunos navegadores/entornos pueden limitar el log de FormData
            console.log('[editFile1] No se pudo listar FormData.entries()');
        }

        set_cargandoArchivo1(true);

        try {
            const res = await axios.post(AIRPARSER_URL, formData, {
                headers: {
                    Authorization: AIRPARSER_AUTH,
                    'Content-Type': 'multipart/form-data',
                },
            });

            set_airParserRespuesta(res.data);
            set_usuarioDetalleDni(res.data?.data || {});
            set_airParserEstado('ok');

            const status = String(res.data?.status ?? '').trim().toLowerCase();
            const esCompletado = status === 'completado';
            if (esCompletado) {
                await subirArchivo1AlPerfil(file);
            }
        } catch (err) {
            set_airParserEstado('error');
            set_airParserError(err?.response?.data?.message || err?.message || 'Error al procesar el DNI');
        } finally {
            set_cargandoArchivo1(false);
            // Limpia el input para permitir volver a subir el mismo archivo si hace falta
            e.target.value = '';
        }
    }

    return (
        <Box>
            <Typography variant="h5">Identidad</Typography>
            <Typography variant="body" sx={{ mb: '1rem' }}>
                Tome una foto clara del frente de su documento de identidad.
Verifique que los datos se vean bien, ya que cuenta con un límite de 3 intentos para completar la validación
            </Typography>

            <Grid sx={{ mt: 1, mb: 1 }} container spacing={2} alignItems="stretch">
                <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column' }}>
                    {subidoArchivo1 && (
                        <Typography sx={{ textAlign: 'center', color: '#5aad55' }}>
                            Se subió correctamente
                        </Typography>
                    )}

                    {(subidoArchivo1 || imageFiles1 || imagendata1) && (
                        <img
                            className="imgprevperfil"
                            src={imagendata1 || imageFiles1}
                            alt="preview"
                            style={{ width: '100%', height: 'auto', flexGrow: 1 }}
                        />
                    )}
                </Grid>

                <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column' }}>
                    <img
                        src={logoArani}
                        alt="Logo Arani"
                        style={{ width: '100%', height: 'auto', flexGrow: 1 }}
                    />
                </Grid>

                {/* Botón subir */}
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button
                        fullWidth
                        disabled={cargandoArchivo1}
                        variant="contained"
                        component="label"
                        startIcon={<span className="material-symbols-outlined">cloud_upload</span>}
                    >
                        {cargandoArchivo1 ? 'Procesando...' : 'Subir identidad frontal'}
                        <input
                            hidden
                            onChange={enviarArchivo1}
                            accept=".png, .jpg, .jpeg"
                            type="file"
                        />
                    </Button>
                </Grid>

                {/* Cancelar rojo (cierra modal principal) */}
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button onClick={reiniciarpantalla} sx={{ mt: 1, mr: 1 }}>
                        Cerrar
                    </Button>                
                </Grid>
            </Grid>

            {/* Modal de espera / resultado (AirParser) */}
            <Dialog
                open={openAirParserModal}
                onClose={cerrarAirParserModal}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    {airParserEstado === 'loading' && 'Procesando identidad...'}
                    {airParserEstado === 'ok' && 'Resultado de lectura'}
                    {airParserEstado === 'error' && 'Ocurrió un error'}
                </DialogTitle>

                <DialogContent dividers>
                    {airParserEstado === 'loading' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                            <CircularProgress size={22} />
                            <Typography variant="body2">
                                Espere un momento, estamos leyendo la información del DNI.
                            </Typography>
                        </Box>
                    )}

                    {airParserEstado === 'ok' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {/* Status con validación visual */}
                            {(() => {
                                const statusRaw = airParserRespuesta?.status ?? '';
                                const status = String(statusRaw).trim().toLowerCase();

                                const esCompletado = status === 'completado';
                                const esIncompleto = status === 'incompleto';

                                const color = esCompletado ? 'success.main' : esIncompleto ? 'error.main' : 'text.primary';
                                const icono = esCompletado ? 'check_circle' : esIncompleto ? 'cancel' : 'info';
                                const label = statusRaw || '—';

                                return (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <span
                                            className="material-symbols-outlined"
                                            style={{ color: esCompletado ? '#2e7d32' : esIncompleto ? '#d32f2f' : undefined }}
                                        >
                                            {icono}
                                        </span>

                                        <Typography variant="body2" sx={{ color }}>
                                            <strong>Status:</strong> {label}
                                            {esCompletado && ' (validación exitosa)'}
                                        </Typography>
                                    </Box>
                                );
                            })()}

                            {/* Mensaje de ayuda cuando es incompleto */}
                            {String(airParserRespuesta?.status ?? '').trim().toLowerCase() === 'incompleto' && (
                                <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                                    No pudimos leer la identidad correctamente. Te invitamos a subir una nueva imagen más legible y con mejor iluminación de tu identidad frontal.
                                </Typography>
                            )}

                            <Box sx={{ mt: 1 }}>
                                <Typography variant="subtitle2">Datos</Typography>
                                <Typography variant="body2">
                                    <strong>Nombres:</strong> {usuarioDetalleDni?.first_name || '—'}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Apellidos:</strong> {usuarioDetalleDni?.surname || '—'}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Número de identidad:</strong> {usuarioDetalleDni?.id_number || '—'}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Fecha de nacimiento:</strong> {usuarioDetalleDni?.date_of_birth || '—'}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Fecha de expiración:</strong> {usuarioDetalleDni?.date_of_expiry || '—'}
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    {airParserEstado === 'error' && (
                        <Typography variant="body2" color="error">
                            {airParserError}
                        </Typography>
                    )}
                </DialogContent>

                <DialogActions>
                    {airParserEstado === 'ok' && (() => {
                        const status = String(airParserRespuesta?.status ?? '').trim().toLowerCase();
                        const esCompletado = status === 'completado';

                        return esCompletado ? (
                            <Button variant="contained" onClick={continuarDespuesDeRespuesta}>
                                Continuar
                            </Button>
                        ) : (
                            <Button onClick={reiniciarpantalla} sx={{ mt: 1, mr: 1 }}>
                                Cerrar
                            </Button>  
                        );
                    })()}

                    {airParserEstado === 'error' && (
                        <Button onClick={cerrarAirParserModal}>Cerrar</Button>
                    )}

                    {airParserEstado === 'loading' && (
                        <Button disabled>Espere...</Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default FormEditFile1;