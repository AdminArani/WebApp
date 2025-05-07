import config from '../config';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import { Button, Typography, Box, Grid} from "@mui/material";
import logoArani from '../images/identidadtrasera.jpg';

//Editar Archivo 2
function FormEditFile2({reiniciarpantalla, usuarioFiles}){
    const gContext = useContext(AppContext);
    const [imageFiles2, set_imageFiles2] = useState(false);

    useEffect(()=>{
        console.log('usuarioFiles', usuarioFiles);
        
        let t20 = usuarioFiles.find(e=>e.type === "20");
        if(t20?.dir) set_imageFiles2(`${config.apiUrl}${t20?.dir}`);

        // eslint-disable-next-line
    }, []);

   

    const [cargandoArchivo2, set_cargandoArchivo2] = useState(false);
    const [subidoArchivo2, set_subidoArchivo2] = useState(false);
    const [imagendata2, set_imagendata2] = useState(false);
    function enviarArchivo2(e){
        console.log('event',e);

        let file = e.target.files[0];
        set_imagendata2(URL.createObjectURL(e.target.files[0]));
        const formData = new FormData();
        formData.append('file2', file);
        formData.append('sid', gContext.logeado?.token);

        set_cargandoArchivo2(true);
        axios.post(`${config.apiUrl}/api/app/putProfileFile.php`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
        }).then((res) => {
            set_cargandoArchivo2(false);
            if(res.data.status === "ER"){
            }
            // if(res.data.status === "ERS"){
            //     localStorage.removeItem('arani_session_id');
            //     gContext.set_logeado({estado: false, token: ''});
            // }
            if(res.data.status === "OK"){
                // reiniciarpantalla();
                set_subidoArchivo2(true);
            }
        }).catch(err => {
            console.log(err.message);
        });
    }    

    return (
        <Box>
        <Typography variant="h5" sx={{}}>Identidad</Typography>
        <Typography variant="body" sx={{ mb: '1rem' }}>
            Suba una fotografía de la parte trasera de su identidad
        </Typography>
        <Grid sx={{ mt: 1, mb: 1 }} container spacing={2} alignItems="stretch">
            <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column' }}>
                {subidoArchivo2 && (
                    <Typography sx={{ textAlign: 'center', color: '#5aad55' }}>
                        Se subió correctamente
                    </Typography>
                )}
                {(subidoArchivo2 || imageFiles2) && (
                    <img
                        className="imgprevperfil"
                        src={imagendata2 || imageFiles2}
                        alt="preview"
                        style={{ width: '100%', height: 'auto', flexGrow: 1 }}
                    />
                )}
            </Grid>
            <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column' }}>
                <img
                    src={logoArani} // Usa la imagen importada
                    alt="Logo Arani"
                    style={{ width: '100%', height: 'auto', flexGrow: 1 }}
                />
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                    fullWidth
                    disabled={cargandoArchivo2 || subidoArchivo2}
                    variant="contained"
                    component="label"
                    startIcon={
                        <span className="material-symbols-outlined">cloud_upload</span>
                    }
                >
                    {cargandoArchivo2 ? 'Subiendo...' : 'Subir identidad trasera'}
                    <input
                        hidden
                        onChange={enviarArchivo2}
                        accept="image/*"
                        multiple
                        type="file"
                    />
                </Button>
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button onClick={reiniciarpantalla} sx={{ mt: 1, mr: 1 }}>
                    Cerrar
                </Button>
            </Grid>
        </Grid>
    </Box>
    )
}

export default FormEditFile2;