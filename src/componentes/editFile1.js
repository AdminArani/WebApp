import config from '../config';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import { Button, Typography, Box, Grid} from "@mui/material";
import logoArani from '../images/identidadfrontal.jpg';

//Editar Archivos
function FormEditFile1({reiniciarpantalla, usuarioFiles}){

    const gContext = useContext(AppContext);
    const [imageFiles1, set_imageFiles1] = useState(false);
    
    useEffect(()=>{
        console.log('usuarioFiles', usuarioFiles);
        
        let t19 = usuarioFiles.find(e=>e.type === "19");
        if(!/\.eu$/.test(t19?.dir)){
            if(t19?.dir) set_imageFiles1(`${config.apiUrl}${t19?.dir}`);
        }

        // eslint-disable-next-line
    }, []);

    const [cargandoArchivo1, set_cargandoArchivo1] = useState(false);
    const [subidoArchivo1, set_subidoArchivo1] = useState(false);
    const [imagendata1, set_imagendata1] = useState(false);
    function enviarArchivo1(e){
        console.log('event',e);

        let file = e.target.files[0];
        set_imagendata1(URL.createObjectURL(e.target.files[0]));
        const formData = new FormData();
        formData.append('file1', file);
        formData.append('sid', gContext.logeado?.token);

        set_cargandoArchivo1(true);
        axios.post(`${config.apiUrl}/api/app/putProfileFile.php`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
        }).then((res) => {
            set_cargandoArchivo1(false);
            
            if(res.data.status === "ER"){
            }
            // if(res.data.status === "ERS"){
            //     localStorage.removeItem('arani_session_id');
            //     gContext.set_logeado({estado: false, token: ''});
            // }
            if(res.data.status === "OK"){
                set_subidoArchivo1(true);
                // reiniciarpantalla();
            }
        }).catch(err => {
            console.log(err.message);
        });
    }

    

    return (
        <Box>
            <Typography variant="h5" sx={{}}>Identidad</Typography>
            <Typography variant="body" sx={{ mb: '1rem' }}>
                Suba una fotografía de la parte frontal de su identidad
            </Typography>
            <Grid 
                sx={{ mt: 1, mb: 1 }} 
                container 
                spacing={2} 
                alignItems="stretch" // Asegura que las columnas tengan la misma altura
            >
                <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column' }}>
                    {subidoArchivo1 && (
                        <Typography sx={{ textAlign: 'center', color: '#5aad55' }}>
                            Se subió correctamente
                        </Typography>
                    )}
                    {(subidoArchivo1 || imageFiles1) && (
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
                        src={logoArani} // Usa la imagen importada
                        alt="Logo Arani"
                        style={{ width: '100%', height: 'auto', flexGrow: 1 }}
                    />
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button
                        fullWidth
                        disabled={cargandoArchivo1 || subidoArchivo1}
                        variant="contained"
                        component="label"
                        startIcon={
                            <span className="material-symbols-outlined">cloud_upload</span>
                        }
                    >
                        {cargandoArchivo1 ? 'Subiendo...' : 'Subir identidad frontal'}
                        <input
                            hidden
                            onChange={enviarArchivo1}
                            accept=".png, .jpg, .jpeg"
                            multiple
                            type="file"
                        />
                    </Button>
                </Grid>
            </Grid>
        </Box>
    )
}

export default FormEditFile1;