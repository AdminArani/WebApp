import { Button, Dialog, DialogContent, useMediaQuery, DialogTitle, DialogActions, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../App";
import axios from "axios";
import { useTheme } from "@emotion/react";
import parse from "html-react-parser";

function Pagare(){
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [dataPagare, set_dataPagare] = useState(false);
    const [openVetana, set_openVetana] = useState(false);
    const [cargandoP, set_cargandoP] = useState(false);
    const gContext = useContext(AppContext);

    useEffect(()=>{
        getPagare();
    }, []);

    useEffect(()=>{
        console.log('dataPagare', dataPagare);
    }, [dataPagare]);

    function getPagare(){
        axios.request({
            url: `${config.apiUrl}/api/app/get_pagare.php`,
            method: "post",
            data: {
                sid: gContext.logeado.token,
                },
        })
        .then((res) => {
            if(res.data.status === "OK"){
                if(res.data.payload?.document_content){
                    set_dataPagare(res.data.payload);
                    set_openVetana(true);
                }else{
                    set_dataPagare(false);
                    set_openVetana(false);
                }
            }
        }).catch(err => {
            console.log(err.message);
        });
    }

    const firmarPagare = ()=>{
        set_cargandoP(true);
        axios.request({
            url: `${config.apiUrl}/api/app/post_contract_sign.php`,
            method: "post",
            data: {
                sid: gContext.logeado.token,
                document_id: dataPagare.id,
                },
        })
        .then((res) => {
            set_cargandoP(false);
            set_openVetana(false);
        }).catch(err => {
            console.log(err.message);
        });
    }

    return (
        <Dialog fullScreen={fullScreen} open={openVetana} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" >
            <DialogTitle>Pagare</DialogTitle>
            <DialogContent dividers>
                {cargandoP && <Typography sx={{textAlign: 'center', m: '4rem auto'}}>Cargando....</Typography>}
                {!cargandoP && 
                <div>
                    {parse(dataPagare.document_content+"")}
                </div>
                }
                
            </DialogContent>
            <DialogActions>
                <Button onClick={()=>{firmarPagare()}}>Firmar</Button>
            </DialogActions>
      </Dialog>
    );
}

export default Pagare;